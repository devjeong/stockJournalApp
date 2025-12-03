import React from 'react';

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

export default Input;
