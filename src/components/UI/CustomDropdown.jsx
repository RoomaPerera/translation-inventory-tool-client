import React from 'react';

// You can move the dropdown-specific CSS from AdminDashboard.css here if you want
// or just keep it there for simplicity.

const CustomDropdown = ({ isOpen, onToggle, selectedValue, options, onSelect }) => {
  return (
    <div className="rubix-dropdown">
      <button 
        className={`rubix-dropdown-button ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
      >
        {selectedValue}
      </button>
      {isOpen && (
        <div className="rubix-dropdown-content">
          {options.map((option) => (
            <div 
              key={option} 
              className="rubix-dropdown-item" 
              onClick={() => onSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;