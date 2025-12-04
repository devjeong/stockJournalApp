import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchStocks } from '../services/stockPrice';

const StockSearch = ({ onSelect, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchStocks(query);
                setResults(data);
                setShowResults(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (stock) => {
        setQuery(stock.description); // Show name in input
        setShowResults(false);
        onSelect(stock);
    };

    return (
        <div className="relative" ref={searchRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1">종목 검색</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 outline-none"
                    placeholder="종목명 또는 티커 (예: 삼성전자, AAPL)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                {loading && (
                    <div className="absolute right-3 top-3.5">
                        <Loader2 className="animate-spin text-blue-500" size={18} />
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                    {results.map((stock, index) => (
                        <button
                            key={`${stock.symbol}-${index}`}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between items-center"
                            onClick={() => handleSelect(stock)}
                        >
                            <div>
                                <p className="font-bold text-gray-900">{stock.description}</p>
                                <p className="text-xs text-gray-500">{stock.symbol}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${stock.type === 'KR' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                {stock.type === 'KR' ? 'KOSPI/DAQ' : 'US'}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockSearch;
