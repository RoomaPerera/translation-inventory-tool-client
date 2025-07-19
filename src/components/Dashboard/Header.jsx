import React from 'react';
import CustomDropdown from '../UI/CustomDropdown';

const Header = ({ 
    isRubixDropdownOpen, 
    onRubixDropdownToggle, 
    selectedRubixProduct, 
    rubixOptions = [],
    onRubixProductSelect, 
    onAssignLanguageClick 
}) => {
  return (
    <header className="flex justify-between items-center bg-white p-4 px-5 rounded-lg shadow-sm mb-5">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold mr-5">GTN Portal</h2>
        <CustomDropdown
          isOpen={isRubixDropdownOpen}
          onToggle={onRubixDropdownToggle}
          selectedValue={selectedRubixProduct}
          options={rubixOptions}
          onSelect={onRubixProductSelect}
          displayKey="name"
        />
        <input type="text" placeholder="Search..." className="p-2 border border-gray-300 rounded-md mr-2.5 text-sm" />
        <span className="text-xs text-gray-500">Keys | Words</span>
      </div>
      <div className="header-right">
        <button 
          className="bg-brand-purple-base text-white py-2.5 px-4 rounded-md text-sm font-semibold transition-colors hover:bg-opacity-80" 
          onClick={onAssignLanguageClick}
        >
          + Assign New Language
        </button>
      </div>
    </header>
  );
};

export default Header;