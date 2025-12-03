import React from 'react';
import { Brain } from 'lucide-react';

const AIScreen = () => (
    <div className="flex flex-col h-full bg-white pb-24">
        <div className="p-6 pt-12 border-b border-gray-100">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="text-purple-600" />
                AI 인사이트
            </h2>
            <p className="text-gray-500 text-sm mt-1">나의 매매 패턴을 분석한 맞춤 제안</p>
        </div>
        <div className="p-6">
            <p>준비 중입니다.</p>
        </div>
    </div>
);

export default AIScreen;
