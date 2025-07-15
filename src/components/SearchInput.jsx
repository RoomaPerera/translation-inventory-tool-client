import React from 'react';
import { SearchIcon } from '@heroicons/react/solid';

export const SearchInput = ({ placeholder }) => {
  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="search"
          name="search"
          id="search"
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}; 