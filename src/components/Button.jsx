import React from 'react';

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

export default Button;
