import axios from 'axios';
import { KOREAN_STOCKS } from '../utils/koreanStocks';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const KIS_APP_KEY = import.meta.env.VITE_KIS_APP_KEY;
const KIS_APP_SECRET = import.meta.env.VITE_KIS_APP_SECRET;

// Cache to prevent hitting API limits
const priceCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute

// KIS Token Management
let kisAccessToken = null;
let kisTokenExpiry = null;

const getKisToken = async () => {
    if (kisAccessToken && kisTokenExpiry && Date.now() < kisTokenExpiry) {
        return kisAccessToken;
    }

    try {
        const response = await axios.post('/kis-api/oauth2/tokenP', {
            grant_type: 'client_credentials',
            appkey: KIS_APP_KEY,
            appsecret: KIS_APP_SECRET
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });

        kisAccessToken = response.data.access_token;
        kisTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Buffer 1 min
        return kisAccessToken;
    } catch (error) {
        console.error("Failed to get KIS token:", error);
        return null;
    }
};

export const searchStocks = async (query) => {
    if (!query) return [];

    const results = [];

    // 1. Search Korean Stocks (Local Data)
    // Simple Hangul check or numeric check
    const isKoreanQuery = /[가-힣]/.test(query) || /^[0-9]+$/.test(query);

    if (isKoreanQuery) {
        const krMatches = KOREAN_STOCKS.filter(stock =>
            stock.name.includes(query) || stock.symbol.includes(query)
        ).slice(0, 5);

        krMatches.forEach(stock => {
            results.push({
                description: stock.name,
                symbol: stock.symbol,
                currency: 'KRW',
                type: 'KR'
            });
        });
    }

    // 2. Search US Stocks (Finnhub)
    // Only search if query has English or numbers (and not purely Korean)
    if (/[a-zA-Z0-9]/.test(query)) {
        try {
            const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`);
            if (response.data && response.data.result) {
                const usMatches = response.data.result
                    .filter(item => !item.symbol.includes('.')) // Filter out non-US exchanges if possible, though Finnhub returns mixed
                    .slice(0, 5);

                usMatches.forEach(stock => {
                    results.push({
                        description: stock.description,
                        symbol: stock.symbol,
                        currency: 'USD',
                        type: 'US'
                    });
                });
            }
        } catch (error) {
            console.error("Finnhub Search Error:", error);
        }
    }

    return results;
};

export const getStockPrice = async (ticker) => {
    // Check cache
    if (priceCache.has(ticker)) {
        const cached = priceCache.get(ticker);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
    }

    let result = null;

    try {
        // Heuristic: Korean stocks are 6 digits
        const isKorean = /^[0-9]{6}$/.test(ticker);

        let price = null;
        if (isKorean) {
            price = await getKoreanStockPrice(ticker);
            if (price) result = { price, currency: 'KRW' };
        } else {
            price = await getUSStockPrice(ticker);
            if (price) result = { price, currency: 'USD' };
        }

        if (result) {
            priceCache.set(ticker, { data: result, timestamp: Date.now() });
        }
    } catch (error) {
        console.error(`Failed to fetch price for ${ticker}:`, error);
    }

    return result;
};

const getUSStockPrice = async (ticker) => {
    if (!FINNHUB_API_KEY) return null;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
        return response.data.c;
    } catch (error) {
        console.error("Finnhub API Error:", error);
        return null;
    }
};

const getKoreanStockPrice = async (ticker) => {
    if (!KIS_APP_KEY || !KIS_APP_SECRET) return null;

    // Note: Calling KIS API directly from browser will likely fail due to CORS.
    // In a real production app, this should be done via a backend proxy.
    // For this dev environment, we'll try to use a proxy if configured in Vite, 
    // or assume the user has a way to bypass CORS (e.g. browser extension) or KIS allows it (unlikely).
    // If this fails, we might need to use a CORS proxy service.

    const token = await getKisToken();
    if (!token) return null;

    try {
        const response = await axios.get('/kis-api/uapi/domestic-stock/v1/quotations/inquire-price', {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${token}`,
                'appkey': KIS_APP_KEY,
                'appsecret': KIS_APP_SECRET,
                'tr_id': 'FHKST01010100' // Transaction ID for current price
            },
            params: {
                'fid_cond_mrkt_div_code': 'J',
                'fid_input_iscd': ticker
            }
        });

        if (response.data && response.data.output && response.data.output.stck_prpr) {
            return parseInt(response.data.output.stck_prpr);
        }
    } catch (error) {
        console.error("KIS API Error:", error);
    }
    return null;
};
