import React from 'react';
// Corrected import path for Heroicons v2
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export const SearchInput = ({ placeholder, value, onChange }) => {
  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {/* Use the new icon name and ensure it renders */}
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="search"
          name="search"
          id="search"
          className="block w-full rounded-md border-gray-300 pl-10 focus:outline-none sm:text-sm"
          placeholder={placeholder}
           value={value}       // Binds the input's display value
          onChange={onChange}   // Connects the typing handler
        />
      </div>
    </div>
  );
};

// Export as named, since it's used that way.
export default SearchInput; 