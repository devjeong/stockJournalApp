import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { addTradeLog, updateTradeLog } from '../services/firestore';

import StockSearch from '../components/StockSearch';
import { getStockPrice } from '../services/stockPrice';

const AddEntryScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [mode, setMode] = useState('manual'); // manual | scan
    const [scanning, setScanning] = useState(false);

    // Check if we are editing
    const editData = location.state?.entry;
    const isEdit = !!editData;

    const [formData, setFormData] = useState({
        date: editData?.date || new Date().toISOString().split('T')[0],
        symbol: editData?.symbol || editData?.ticker || '', // Support legacy 'ticker' field
        name: editData?.name || '',
        type: editData?.type || 'buy',
        price: editData?.price || '',
        quantity: editData?.quantity || '',
        profit: editData?.profit || '',
        notes: editData?.notes || ''
    });

    const fileInputRef = React.useRef(null);

    const handleStockSelect = async (stock) => {
        setFormData(prev => ({
            ...prev,
            symbol: stock.symbol,
            name: stock.description
        }));

        // Fetch current price to auto-fill
        try {
            const priceData = await getStockPrice(stock.symbol);
            if (priceData && priceData.price) {
                setFormData(prev => ({
                    ...prev,
                    price: priceData.price
                }));
            }
        } catch (error) {
            console.error("Failed to auto-fill price:", error);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);

        try {
            // Simulate upload and OCR delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setScanning(false);
            setMode('manual');
            setFormData(prev => ({
                ...prev,
                symbol: '373220',
                name: 'LG에너지솔루션',
                price: '385000',
                quantity: '5',
                type: 'buy',
                profit: '',
                notes: `[Smart Scan] ${file.name} 분석 완료`
            }));
            alert('이미지 분석 완료! 내용이 자동으로 입력되었습니다.');
        } catch (error) {
            console.error(error);
            setScanning(false);
            alert("분석 실패");
        }
    };

    const handleSubmit = async () => {
        // Validation Check
        if (!formData.symbol || !formData.price || !formData.quantity) {
            alert("종목, 가격, 수량은 필수 입력 항목입니다.");
            return;
        }

        try {
            if (!user) {
                alert("로그인이 필요합니다.");
                return;
            }

            const dataToSave = {
                ...formData,
                ticker: formData.symbol, // Keep 'ticker' for backward compatibility if needed, or just use symbol
                profit: formData.type === 'sell' ? (formData.profit || 0) : 0
            };

            if (isEdit) {
                await updateTradeLog(user.uid, editData.id, dataToSave);
                alert("성공적으로 수정되었습니다!");
            } else {
                await addTradeLog(user.uid, dataToSave);
                alert("성공적으로 저장되었습니다!");
            }
            navigate('/journal');
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("저장 실패: " + error.message);
        }
    };

    if (mode === 'scan') {
        return (
            <div className="h-screen bg-black relative flex flex-col items-center justify-center p-6">
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button onClick={() => fileInputRef.current.click()} className="w-full bg-white text-black hover:bg-gray-200">
                            촬영 / 앨범 선택
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen bg-white flex flex-col pb-24">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center pt-12">
                <h2 className="text-xl font-bold">{isEdit ? '매매 수정하기' : '매매 기록하기'}</h2>
                <button onClick={() => navigate('/journal')} className="text-gray-500">취소</button>
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

                    <StockSearch
                        onSelect={handleStockSelect}
                        initialValue={formData.name || formData.symbol}
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

                    {formData.type === 'sell' && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <Input
                                label="실현 손익 (Realized Profit)"
                                type="number"
                                placeholder="0 (수수료 제외 순수익)"
                                value={formData.profit}
                                onChange={e => setFormData({ ...formData, profit: e.target.value })}
                            />
                            <p className="text-xs text-blue-500 mt-[-10px]">
                                * 매도 시 발생한 확정 수익/손실금을 입력하세요.
                            </p>
                        </div>
                    )}

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

export default AddEntryScreen;
