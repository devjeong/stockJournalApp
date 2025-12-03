import React, { useEffect, useState } from 'react';
import { Trash2, Search, Filter, Edit2 } from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTradeLogsQuery, deleteTradeLog } from '../services/firestore';

const JournalScreen = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, buy, sell

    useEffect(() => {
        if (!user) return;
        const q = getTradeLogsQuery(user.uid);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLogs(data);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await deleteTradeLog(user.uid, id);
        }
    };

    const handleEdit = (entry) => {
        navigate('/add', { state: { entry } });
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || log.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="h-full bg-gray-50 flex flex-col pb-24">
            <div className="bg-white p-6 pt-12 shadow-sm z-10">
                <h2 className="text-2xl font-bold mb-4">매매일지</h2>

                {/* Search & Filter */}
                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="종목명, 메모 검색"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 bg-gray-100 rounded-xl text-gray-600">
                        <Filter size={18} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {['all', 'buy', 'sell'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filterType === type ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {type === 'all' ? '전체' : type === 'buy' ? '매수' : '매도'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredLogs.map(log => (
                    <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${log.type === 'buy' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {log.type === 'buy' ? 'BUY' : 'SELL'}
                                </span>
                                <span className="text-xs text-gray-400">{log.date}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(log)} className="text-gray-400 hover:text-blue-500">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(log.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{log.ticker}</h3>
                                <p className="text-sm text-gray-500">{log.quantity}주 @ {parseInt(log.price).toLocaleString()}원</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">
                                    {(parseInt(log.price) * parseInt(log.quantity)).toLocaleString()}원
                                </p>
                                {log.type === 'sell' && log.profit && (
                                    <p className={`text-xs font-bold ${log.profit > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {log.profit > 0 ? '+' : ''}{parseInt(log.profit).toLocaleString()}원
                                    </p>
                                )}
                            </div>
                        </div>

                        {log.notes && (
                            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600">
                                {log.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JournalScreen;
