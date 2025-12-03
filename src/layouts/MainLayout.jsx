import React from 'react';
import { Outlet } from 'react-router-dom';
import TabBar from '../components/TabBar';

const MainLayout = () => {
    return (
        <div className="max-w-md mx-auto h-screen bg-gray-50 shadow-2xl relative overflow-hidden font-sans text-gray-900 flex flex-col">
            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                <Outlet />
            </div>
            <TabBar />
        </div>
    );
};

export default MainLayout;
