import React, { useState } from 'react';
// Corrected import path for Heroicons v2
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const PasswordInput = ({ label, name, placeholder, required = false, value, onChange }) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const toggleVisibility = () => {
        setPasswordVisible(!isPasswordVisible);
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
                <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    name={name}
                    id={name}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={onChange}
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={toggleVisibility}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                    {isPasswordVisible ? (
                        // Use the new EyeSlashIcon
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            </div>
        </div>
    );
};

// Export as named, since it's used that way.
export default PasswordInput;