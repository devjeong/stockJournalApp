import axios from 'axios';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const KIS_APP_KEY = import.meta.env.VITE_KIS_APP_KEY;
const KIS_APP_SECRET = import.meta.env.VITE_KIS_APP_SECRET;

// Cache to prevent hitting API limits
const priceCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute

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
        // Simple heuristic: Korean stocks usually are numeric (e.g., "005930") or have Korean names
        // US stocks are usually alphabetic (e.g., "AAPL")
        const isKorean = /^[0-9]{6}$/.test(ticker) || /[가-힣]/.test(ticker);

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
    if (!FINNHUB_API_KEY) {
        console.warn("Finnhub API Key missing");
        return null;
    }

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
        return response.data.c; // 'c' is the current price
    } catch (error) {
        console.error("Finnhub API Error:", error);
        throw error;
    }
};

const getKoreanStockPrice = async (ticker) => {
    // KIS API implementation requires complex auth (token generation).
    // For this MVP, we will check if keys exist, otherwise return null.
    // Real implementation would need a backend proxy to hide secrets and handle CORS.

    if (!KIS_APP_KEY || !KIS_APP_SECRET) {
        // console.warn("KIS API Keys missing");
        return null;
    }

    // Placeholder for KIS logic
    // 1. Get Access Token (POST /oauth2/tokenP)
    // 2. Get Price (GET /uapi/domestic-stock/v1/quotations/inquire-price)

    return null;
};
