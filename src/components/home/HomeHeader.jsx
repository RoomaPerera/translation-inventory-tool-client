import React from 'react';
import { SearchInput } from '../reusableComponents/SearchInput';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select'; // Import the reusable Select

const HomeHeader = ({ onAssignLanguageClick }) => {
    // Dummy options for the product dropdown
    const productOptions = [{ value: 'rubix', label: 'Rubix' }];

  return (
    <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg shadow-sm mb-5">
      <div className="flex items-center gap-5"> {/* Added gap for spacing */}
        <h2 className="text-xl font-semibold">Translation Dashboard</h2>
        
        {/* === THE MISSING DROPDOWN IS NOW RESTORED HERE === */}
        <div className="w-40">
           <Select options={productOptions} selected={'rubix'} onSelect={() => {}} />
        </div>
        
        <div className="w-64">
           <SearchInput placeholder="Search Keys or Words..." />
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