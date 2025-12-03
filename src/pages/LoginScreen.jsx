import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
    const { loginWithGoogle, loginAnonymously } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleDemoLogin = async () => {
        try {
            await loginAnonymously();
            navigate('/');
        } catch (error) {
            console.error("Demo login failed", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white p-6 justify-center max-w-md mx-auto">
            <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-200">
                    <TrendingUp size={40} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Trade Mate</h1>
                <p className="text-gray-500">성공적인 투자를 위한 첫 걸음</p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={handleDemoLogin}
                    className="w-full py-3.5 px-4 bg-gray-900 text-white rounded-xl flex items-center justify-center font-medium shadow-lg hover:bg-gray-800 transition-colors"
                >
                    <div className="mr-2"></div> Apple로 계속하기 (Demo)
                </button>
                <button
                    onClick={handleGoogleLogin}
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
};

export default LoginScreen;
