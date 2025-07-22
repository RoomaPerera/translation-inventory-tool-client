import React from 'react';

export const Input = ({ label, name, placeholder, required = false, type = 'text', value, onChange, accept, children }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1">
        {type === 'textarea' ? (
          <textarea
            name={name}
            id={name}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            rows={5}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            id={name}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={value}
            onChange={onChange}
            required={required}
          >
            {children}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            id={name}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            accept={accept}
          />
        )}
      </div>
    </div>
  );
};
