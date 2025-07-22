import React from 'react';
import { SearchInput } from '../reusableComponents/SearchInput';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';

// This component receives the raw handler function from the Home page.
const HomeHeader = ({ searchTerm, onSearchChange, onAssignLanguageClick }) => {
    const productOptions = [{ value: 'Rubix', label: 'Rubix' }];

  return (
    <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg shadow-sm mb-5">
      <div className="flex items-center gap-5">
        <h2 className="text-xl font-semibold">Translation Dashboard</h2>
        <div className="w-40">
           <Select options={productOptions} selected={'Rubix'} onSelect={() => {}} />
        </div>
        <div className="w-64">
           {/*
             THE FIX IS HERE:
             We pass the `onSearchChange` handler directly to the `onChange` prop.
             The `SearchInput` component expects to receive the raw event 'e',
             and the `Home` page's handler is designed to receive the extracted value.
             This correctly wires them together.
           */}
           <SearchInput
              placeholder="Search by Key..."
              value={searchTerm}
              onChange={onSearchChange}
           />
        </div>
      </div>
      <div className="header-right">
        <Button
          onClick={onAssignLanguageClick}
          className="bg-brand-purple-base hover:bg-opacity-80 text-white !py-2.5 !px-4"
        >
          + Assign New Language
        </Button>
      </div>
    </div>
  );
};

export default HomeHeader;