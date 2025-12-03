import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const ProfileScreen = () => {
    const { user, logout, currency, toggleCurrency } = useAuth();
    return (
        <div className="p-6 pt-12 flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-1">Investor</h2>
            <p className="text-gray-500 mb-8">{user?.uid?.slice(0, 6)}...</p>

            <div className="w-full mb-4">
                <Button onClick={toggleCurrency} variant="secondary" className="w-full mb-2">
                    통화 변경 ({currency})
                </Button>
                <Button onClick={logout} variant="outline" className="w-full">로그아웃</Button>
            </div>
        </div>
    );
};

export default ProfileScreen;
