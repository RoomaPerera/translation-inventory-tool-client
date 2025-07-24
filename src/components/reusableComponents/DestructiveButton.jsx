import React from 'react';

const styleVariants = {
    solid: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-transparent text-red-600 border border-red-500 hover:bg-red-50',
};

export const DestructiveButton = ({ children, variant = 'solid', onClick, type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`inline-flex items-center justify-center px-3 py-1 rounded-md font-semibold text-sm transition-colors ${styleVariants[variant]}`}
        >
            {children}
        </button>
    );
};