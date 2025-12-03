import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
    LineChart,
    Plus,
    Calendar,
    Settings,
    Camera,
    TrendingUp,
    TrendingDown,
    User,
    LogOut,
    Brain,
    Loader2,
    Apple,
    Search,
    ChevronRight
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'stock-journal-default';

// --- Styles & Theme ---
const colors = {
    primary: '#3B82F6', // Blue
    buy: '#EF4444',     // Red (Korean stock market uses Red for up/buy usually, but sticking to standard UI pattern: Red for Buy/Up in KR, Blue for Sell/Down in KR. wait.. strictly in KR market: Red = Up, Blue = Down. Let's stick to Buy=Red, Sell=Blue for KR context)
    sell: '#3B82F6',    // Blue
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#1F2937',
    textSub: '#6B7280'
};

// --- Helper Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseStyle = "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center active:scale-95";
    const variants = {
        primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
        buy: "bg-red-500 text-white shadow-md shadow-red-100",
        sell: "bg-blue-500 text-white shadow-md shadow-blue-100",
        outline: "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 outline-none transition-all"
        />
    </div>
);

const TabBar = ({ currentTab, setTab }) => {
    const tabs = [
        { id: 'home', icon: LineChart, label: '홈' },
        { id: 'journal', icon: Calendar, label: '일지' },
        { id: 'add', icon: Plus, label: '기록', main: true },
        { id: 'ai', icon: Brain, label: 'AI분석' },
        { id: 'profile', icon: User, label: 'MY' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-end pb-6 z-50">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setTab(tab.id)}
                    className={`flex flex-col items-center justify-center transition-colors ${tab.main ? '-mt-8' : ''
                        } ${currentTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <div className={`${tab.main
                            ? 'bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-300 mb-1 transform transition-transform hover:scale-105'
                            : 'p-1'
                        }`}>
                        <tab.icon size={tab.main ? 28 : 24} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

// --- Main Screens ---

// 1. Login Screen
const LoginScreen = ({ onLogin }) => (
    <div className="flex flex-col h-screen bg-white p-6 justify-center">
        <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-200">
                <TrendingUp size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trade Mate</h1>
            <p className="text-gray-500">성공적인 투자를 위한 첫 걸음</p>
        </div>

        <div className="space-y-3">
            <button
                onClick={onLogin}
                className="w-full py-3.5 px-4 bg-gray-900 text-white rounded-xl flex items-center justify-center font-medium shadow-lg hover:bg-gray-800 transition-colors"
            >
                <div className="mr-2"></div> Apple로 계속하기
            </button>
            <button
                onClick={onLogin}
                className="w-full py-3.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center font-medium hover:bg-gray-50 transition-colors"
            >
                <span className="mr-2 font-bold text-blue-500">G</span> Google로 계속하기
            </button>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
            계속 진행하면 서비스 이용약관에 동의하게 됩니다.
        </p>
    </div>
);

// 2. Home Dashboard
const HomeScreen = ({ entries, loading }) => {
    const totalTrades = entries.length;
    // Simple logic to calculate hypothetical win rate
    const wins = entries.filter(e => e.type === 'sell' && e.profit > 0).length; // Mock profit logic needed
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-24">
            <header className="bg-white p-6 pt-12 rounded-b-3xl shadow-sm z-10 sticky top-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">이번 달 실현 손익</p>
                        <h2 className="text-3xl font-bold text-gray-900">₩ 1,250,000</h2>
                    </div>
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                        +12.5%
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

            <div className="p-6">
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
                                    <p className="font-bold text-gray-900">{parseInt(entry.price).toLocaleString()}원</p>
                                    <p className="text-xs text-gray-500">{entry.quantity}주</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// 3. Add Entry Screen (Manual + OCR Simulation)
const AddEntryScreen = ({ onSave, onCancel }) => {
    const [mode, setMode] = useState('manual'); // manual | scan
    const [scanning, setScanning] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        ticker: '',
        type: 'buy',
        price: '',
        quantity: '',
        notes: ''
    });

    const handleScan = () => {
        // Simulate OCR Process
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setMode('manual');
            setFormData({
                ...formData,
                ticker: '삼성전자',
                price: '72500',
                quantity: '10',
                type: 'buy',
                notes: '[자동입력] 키움증권 체결 스크린샷'
            });
            alert('이미지 분석 완료! 내용이 자동으로 입력되었습니다.');
        }, 2000);
    };

    const handleSubmit = () => {
        if (!formData.ticker || !formData.price) return;
        onSave(formData);
    };

    if (mode === 'scan') {
        return (
            <div className="h-full bg-black relative flex flex-col items-center justify-center p-6">
                <button onClick={() => setMode('manual')} className="absolute top-6 left-6 text-white p-2">
                    ✕ 닫기
                </button>

                {scanning ? (
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-white font-medium animate-pulse">매매 내역 분석 중...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-full aspect-[3/4] border-2 border-white/30 rounded-3xl mb-8 relative overflow-hidden bg-gray-800 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <Camera size={48} className="mx-auto mb-2 opacity-50" />
                                <p>매매 체결 내역을 촬영하세요</p>
                            </div>
                            <div className="absolute inset-0 border-4 border-blue-500/50 rounded-3xl animate-pulse"></div>
                        </div>
                        <Button onClick={handleScan} className="w-full bg-white text-black hover:bg-gray-200">
                            촬영 / 앨범 선택
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col pb-24">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center pt-12">
                <h2 className="text-xl font-bold">매매 기록하기</h2>
                <button onClick={onCancel} className="text-gray-500">취소</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Toggle Input Method */}
                <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                        onClick={() => setMode('manual')}
                    >
                        직접 입력
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${mode === 'scan' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                        onClick={() => setMode('scan')}
                    >
                        <Camera size={14} />
                        스마트 스캔
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            onClick={() => setFormData({ ...formData, type: 'buy' })}
                            className={`py-3 rounded-xl font-bold border-2 transition-all ${formData.type === 'buy' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                        >
                            매수 (Buy)
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, type: 'sell' })}
                            className={`py-3 rounded-xl font-bold border-2 transition-all ${formData.type === 'sell' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                        >
                            매도 (Sell)
                        </button>
                    </div>

                    <Input
                        label="날짜"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                    <Input
                        label="종목명"
                        placeholder="예: 삼성전자, Tesla"
                        value={formData.ticker}
                        onChange={e => setFormData({ ...formData, ticker: e.target.value })}
                    />
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                label="가격 (단가)"
                                type="number"
                                placeholder="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="수량"
                                type="number"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">메모</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 outline-none h-24 resize-none"
                            placeholder="매매 원칙, 감정 상태 등을 기록하세요"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100">
                <Button onClick={handleSubmit} className="w-full py-4 text-lg">기록 저장하기</Button>
            </div>
        </div>
    );
};

// 4. Journal/List Screen
const JournalScreen = ({ entries, onDelete }) => (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
        <div className="bg-white p-6 pt-12 pb-4 shadow-sm sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-gray-900">매매 일지</h2>
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                {['전체', '1개월', '3개월', '6개월'].map((filter, i) => (
                    <button key={i} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
            {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${entry.type === 'buy' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {entry.type === 'buy' ? 'BUY' : 'SELL'}
                            </span>
                            <span className="font-bold text-lg text-gray-800">{entry.ticker}</span>
                        </div>
                        <button
                            onClick={() => onDelete(entry.id)}
                            className="text-gray-300 hover:text-red-500 p-1"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-gray-500">가격</div>
                        <div className="text-right font-medium">{parseInt(entry.price).toLocaleString()}원</div>
                        <div className="text-gray-500">수량</div>
                        <div className="text-right font-medium">{entry.quantity}주</div>
                        <div className="text-gray-500">총액</div>
                        <div className="text-right font-bold text-gray-900">{(parseInt(entry.price) * parseInt(entry.quantity)).toLocaleString()}원</div>
                    </div>

                    {entry.notes && (
                        <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {entry.notes}
                        </div>
                    )}

                    <div className="absolute -left-1 top-6 w-1 h-8 rounded-r-full bg-gray-300"></div>
                    <p className="text-xs text-gray-400 mt-2 text-right">{entry.date}</p>
                </div>
            ))}
        </div>
    </div>
);

// 5. AI Insight (Mockup)
const AIInsightScreen = () => (
    <div className="flex flex-col h-full bg-white pb-24">
        <div className="p-6 pt-12 border-b border-gray-100">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="text-purple-600" />
                AI 인사이트
            </h2>
            <p className="text-gray-500 text-sm mt-1">나의 매매 패턴을 분석한 맞춤 제안</p>
        </div>

        <div className="p-6 overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-200 mb-8">
                <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    <span>Premium Beta</span>
                </div>
                <h3 className="text-xl font-bold mb-2">삼성전자 매수 타이밍 포착</h3>
                <p className="text-purple-100 text-sm mb-6 leading-relaxed">
                    최근 귀하의 매매 패턴과 유사한 시장 상황입니다. 지난 3개월 데이터 기반으로 현재 구간 매수가 유리해 보입니다.
                </p>
                <button className="w-full py-3 bg-white text-purple-700 font-bold rounded-xl text-sm">
                    상세 분석 리포트 보기
                </button>
            </div>

            <h3 className="font-bold text-gray-800 mb-4">관심 종목 뉴스 요약</h3>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0"></div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm mb-1">반도체 섹터 주간 전망: 상승세 지속될까?</p>
                            <p className="text-xs text-gray-500 line-clamp-2">주요 기업들의 실적 발표가 이어지는 가운데, AI 관련 수요 증가로 인한...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auth Effect
    useEffect(() => {
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        };

        initAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Data Effect
    useEffect(() => {
        if (!user) {
            setEntries([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'artifacts', appId, 'users', user.uid, 'trade_logs'),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEntries(logs);
            setLoading(false);
        }, (error) => {
            console.error("Data fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Handlers
    const handleLogin = async () => {
        // In a real app, use GoogleAuthProvider / OAuthProvider
        // For this immersive, we already init anonymous auth, but this simulates the button action
        if (!user) {
            await signInAnonymously(auth);
        }
    };

    const handleLogout = () => signOut(auth);

    const handleSaveEntry = async (data) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'trade_logs'), {
                ...data,
                createdAt: serverTimestamp()
            });
            setActiveTab('journal');
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteEntry = async (id) => {
        if (!user || !window.confirm('이 기록을 삭제하시겠습니까?')) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trade_logs', id));
        } catch (e) {
            console.error(e);
        }
    };

    // Render Logic
    if (!user) return <LoginScreen onLogin={handleLogin} />;

    return (
        <div className="max-w-md mx-auto h-screen bg-gray-50 shadow-2xl relative overflow-hidden font-sans text-gray-900">
            {/* Content Area */}
            <div className="h-full">
                {activeTab === 'home' && <HomeScreen entries={entries} loading={loading} />}
                {activeTab === 'journal' && <JournalScreen entries={entries} onDelete={handleDeleteEntry} />}
                {activeTab === 'add' && <AddEntryScreen onSave={handleSaveEntry} onCancel={() => setActiveTab('home')} />}
                {activeTab === 'ai' && <AIInsightScreen />}
                {activeTab === 'profile' && (
                    <div className="p-6 pt-12 flex flex-col items-center justify-center h-full">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                            <User size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">Investor</h2>
                        <p className="text-gray-500 mb-8">{user.uid.slice(0, 6)}...</p>
                        <Button onClick={handleLogout} variant="outline" className="w-full">로그아웃</Button>
                    </div>
                )}
            </div>

            {/* Navigation - Hide on Add screen to focus on input */}
            {activeTab !== 'add' && <TabBar currentTab={activeTab} setTab={setActiveTab} />}
        </div>
    );
}