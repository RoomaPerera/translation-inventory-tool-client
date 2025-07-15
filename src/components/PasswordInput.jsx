import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

export const PasswordInput = ({ label, name, placeholder, required = false }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type={isPasswordVisible ? 'text' : 'password'}
          name={name}
          id={name}
          className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={toggleVisibility}
          aria-label="Toggle password visibility"
        >
          {isPasswordVisible ? (
            <EyeOffIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}; 