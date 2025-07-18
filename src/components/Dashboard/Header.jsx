import React from 'react';
import CustomDropdown from '../UI/CustomDropdown';

const Header = ({ 
    isRubixDropdownOpen, 
    onRubixDropdownToggle, 
    selectedRubixProduct, 
    onRubixProductSelect, 
    onAssignLanguageClick 
}) => {
  const rubixOptions = ['Product 1', 'Product 2', 'Product 3'];

  return (
    <header className="header">
      <div className="header-left">
        <h2>GTN Portal</h2>
        <CustomDropdown
          isOpen={isRubixDropdownOpen}
          onToggle={onRubixDropdownToggle}
          selectedValue={selectedRubixProduct}
          options={rubixOptions}
          onSelect={onRubixProductSelect}
        />
        <input type="text" placeholder="Search..." className="search-input" />
        <span className="search-hint">Keys | Words</span>
      </div>
      <div className="header-right">
        {/* The onClick now calls a function passed down via props */}
        <button 
          className="assign-language-button" 
          onClick={onAssignLanguageClick}
        >
          + Assign New Language
        </button>
      </div>
    </header>
  );
};

export default Header;