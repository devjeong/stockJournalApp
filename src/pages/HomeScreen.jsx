import React, { useEffect, useState, useMemo } from 'react';
import { ChevronRight, Loader2, Wallet, Calendar, RefreshCw } from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getTradeLogsQuery } from '../services/firestore';
import { calculateHoldings } from '../utils/portfolio';
import { getStockPrice } from '../services/stockPrice';

const HomeScreen = () => {
    const { user, currency, toggleCurrency } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRate, setExchangeRate] = useState(1400); // Default fallback
    const [timeFilter, setTimeFilter] = useState('month'); // day, week, month, year
    const [currentPrices, setCurrentPrices] = useState({});
    const [priceLoading, setPriceLoading] = useState(false);

    useEffect(() => {
        // Fetch Real-time Exchange Rate
        const fetchRate = async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();
                if (data && data.rates && data.rates.KRW) {
                    setExchangeRate(data.rates.KRW);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate:", error);
            }
        };
        fetchRate();
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = getTradeLogsQuery(user.uid);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEntries(logs);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const holdings = useMemo(() => calculateHoldings(entries), [entries]);

    // Fetch Current Prices for Holdings
    const fetchPrices = async () => {
        if (holdings.length === 0) return;
        setPriceLoading(true);
        const prices = {};
        await Promise.all(holdings.map(async (h) => {
            // Use symbol for fetching price
            const data = await getStockPrice(h.symbol);
            if (data) {
                prices[h.symbol] = data;
            }
        }));
        setCurrentPrices(prev => ({ ...prev, ...prices }));
        setPriceLoading(false);
    };

    useEffect(() => {
        if (holdings.length > 0) {
            fetchPrices();
        }
    }, [holdings]);

    // Calculate Total Holdings Value (Current Market Value)
    // Normalize everything to KRW first for calculation
    const totalHoldingsValueKRW = holdings.reduce((acc, cur) => {
        const priceData = currentPrices[cur.symbol];
        let currentPriceKRW = cur.avgPrice; // Fallback to avgPrice (which is assumed to be in KRW for simplicity or needs normalization)

        // Note: In a real app, we should store the currency of the trade log. 
        // Here we assume trade logs are entered in KRW or we treat them as raw numbers.
        // But for *current* price, we know the currency.

        if (priceData) {
            if (priceData.currency === 'USD') {
                currentPriceKRW = priceData.price * exchangeRate;
            } else {
                currentPriceKRW = priceData.price;
            }
        }

        return acc + (currentPriceKRW * cur.quantity);
    }, 0);

    const totalInvestedKRW = holdings.reduce((acc, cur) => acc + (cur.avgPrice * cur.quantity), 0);
    const totalUnrealizedProfitKRW = totalHoldingsValueKRW - totalInvestedKRW;
    const totalUnrealizedProfitRate = totalInvestedKRW > 0 ? (totalUnrealizedProfitKRW / totalInvestedKRW) * 100 : 0;

    const totalTrades = entries.length;

    // Filter Entries by Time
    const filteredEntries = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return entries.filter(e => {
            const d = new Date(e.date);
            switch (timeFilter) {
                case 'day': return d >= startOfDay;
                case 'week': return d >= startOfWeek;
                case 'month': return d >= startOfMonth;
                case 'year': return d >= startOfYear;
                default: return true;
            }
        });
    }, [entries, timeFilter]);

    // Calculate Profit based on Filtered Entries
    const realizedProfitKRW = filteredEntries.reduce((acc, cur) => {
        return acc + (cur.profit ? parseInt(cur.profit) : 0);
    }, 0);

    const displayProfit = currency === 'KRW' ? realizedProfitKRW : (realizedProfitKRW / exchangeRate);
    const displayHoldings = currency === 'KRW' ? totalHoldingsValueKRW : (totalHoldingsValueKRW / exchangeRate);
    const displayUnrealized = currency === 'KRW' ? totalUnrealizedProfitKRW : (totalUnrealizedProfitKRW / exchangeRate);
    const displaySymbol = currency === 'KRW' ? '₩' : '$';

    const formatMoney = (val) => currency === 'KRW'
        ? Math.round(val).toLocaleString()
        : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatPrice = (price, priceCurrency = 'KRW') => {
        // If we want to display in the Global Currency (currency state)
        let val = price;

        // Normalize to KRW first
        if (priceCurrency === 'USD') val = price * exchangeRate;

        // Then convert to Target Currency
        if (currency === 'USD') val = val / exchangeRate;

        if (currency === 'KRW') return `₩${Math.round(val).toLocaleString()}`;
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Win Rate Logic (All time)
    const sellTrades = entries.filter(e => e.type === 'sell');
    const wins = sellTrades.filter(e => e.profit > 0).length;
    const winRate = sellTrades.length > 0 ? Math.round((wins / sellTrades.length) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-24">
            <header className="bg-white p-6 pt-12 rounded-b-3xl shadow-sm z-10 sticky top-0">
                {/* Total Holdings Value */}
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Wallet size={14} /> 총 보유 자산 (평가금)
                            </p>
                            <h2 className="text-4xl font-bold text-gray-900">
                                {displaySymbol} {formatMoney(displayHoldings)}
                            </h2>
                            <div className={`text-sm font-bold mt-1 ${totalUnrealizedProfitKRW >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                {totalUnrealizedProfitKRW >= 0 ? '+' : ''}{formatMoney(displayUnrealized)} ({totalUnrealizedProfitRate.toFixed(1)}%)
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleCurrency}
                                className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                                {currency}
                            </button>
                            <button
                                onClick={fetchPrices}
                                disabled={priceLoading}
                                className={`p-2 rounded-full bg-gray-100 text-gray-600 ${priceLoading ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Realized Profit Section with Time Filter */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} /> 실현 손익
                        </p>
                        <div className="flex bg-white rounded-lg p-1 shadow-sm">
                            {['day', 'week', 'month', 'year'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeFilter(t)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${timeFilter === t ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t === 'day' ? '일' : t === 'week' ? '주' : t === 'month' ? '월' : '년'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-2xl font-bold ${displayProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                            {displaySymbol} {formatMoney(displayProfit)}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-xs text-gray-500 mb-1">총 매매 횟수</p>
                        <p className="text-xl font-bold text-gray-800">{totalTrades}회</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-xs text-gray-500 mb-1">승률</p>
                        <p className="text-xl font-bold text-gray-800">{winRate}%</p>
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Holdings Section */}
                <section>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Wallet size={18} className="text-gray-600 mr-2" />
                        보유 종목
                    </h3>
                    {holdings.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">보유 중인 종목이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {holdings.map(holding => {
                                const priceData = currentPrices[holding.symbol];
                                let currentPrice = null;
                                let profitRate = 0;

                                if (priceData) {
                                    // Calculate Profit Rate
                                    // Normalize both to KRW for calculation
                                    let currentPriceKRW = priceData.price;
                                    if (priceData.currency === 'USD') currentPriceKRW *= exchangeRate;

                                    // Assuming avgPrice is in KRW (simplification)
                                    profitRate = ((currentPriceKRW - holding.avgPrice) / holding.avgPrice) * 100;
                                    currentPrice = priceData.price;
                                }

                                return (
                                    <div key={holding.symbol} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <p className="font-bold text-gray-900">{holding.name}</p>
                                                <p className="text-xs text-gray-400">{holding.symbol}</p>
                                            </div>
                                            {priceData && (
                                                <span className={`text-xs font-bold ${profitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            <span className="font-medium text-gray-800">{holding.quantity}주</span> 보유
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-xs text-gray-400">평단가</div>
                                                <div className="font-bold text-gray-800">{formatPrice(holding.avgPrice)}</div>
                                            </div>
                                            {priceData && (
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-400">현재가</div>
                                                    <div className={`font-bold ${profitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                        {formatPrice(currentPrice, priceData.currency)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Recent Activity Section */}
                <section>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        최근 매매 활동
                        <ChevronRight size={16} className="text-gray-400 ml-1" />
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">아직 기록된 매매가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.slice(0, 5).map(entry => (
                                <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.type === 'buy' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {entry.type === 'buy' ? '매수' : '매도'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{entry.ticker}</p>
                                            <p className="text-xs text-gray-500">{entry.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatPrice(parseInt(entry.price))}</p>
                                        <p className="text-xs text-gray-500">{entry.quantity}주</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HomeScreen;
