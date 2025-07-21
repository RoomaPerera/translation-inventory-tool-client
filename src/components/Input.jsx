import React from 'react';

export const Input = ({
  label,
  name,
  placeholder,
  required = false,
  type = "text",
  value,
  onChange,
  id,
  className = "",
  ...props
}) => {
  return (
    <div>
      <label htmlFor={id || name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1">
        <input
          type={type}
          name={name}
          id={id || name}
          value={value}
          onChange={onChange}
          className={`block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${className}`}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};