import React from 'react';
import { LineChart, Plus, Calendar, Brain, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TabBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentTab = location.pathname;

    const tabs = [
        { id: '/', icon: LineChart, label: '홈' },
        { id: '/journal', icon: Calendar, label: '일지' },
        { id: '/add', icon: Plus, label: '기록', main: true },
        { id: '/ai', icon: Brain, label: 'AI분석' },
        { id: '/profile', icon: User, label: 'MY' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-end pb-6 z-50 max-w-md mx-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => navigate(tab.id)}
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

export default TabBar;
