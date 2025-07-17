import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// The 'options' prop should be an array of objects, e.g., [{ value: 'admin', label: 'Admin' }]
export const Select = ({ label, options, selected, onSelect }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 pr-10 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}; 