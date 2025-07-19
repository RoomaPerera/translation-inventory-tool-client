import React from 'react';

const CustomDropdown = ({ 
  isOpen, 
  onToggle, 
  selectedValue, 
  options, 
  onSelect, 
  displayKey = null 
}) => {
  const getDisplayValue = (option) => {
    if (displayKey && typeof option === 'object') {
      return option[displayKey];
    }
    return option;
  };

  const getKey = (option, index) => {
    if (typeof option === 'object' && option._id) {
      return option._id;
    }
    return index;
  };

  return (
    <div className="relative mr-5">
      <button 
        className="flex items-center justify-between py-2 pl-3 pr-2 border border-gray-300 rounded-md bg-white cursor-pointer w-[150px] text-left"
        onClick={onToggle}
      >
        <span>{selectedValue}</span>
        <svg className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg w-full z-10 mt-1 max-h-52 overflow-y-auto">
          {options.map((option, index) => (
            <div 
              key={getKey(option, index)} 
              className="py-2 px-4 cursor-pointer text-sm transition-colors hover:bg-gray-100" 
              onClick={() => onSelect(option)}
            >
              {getDisplayValue(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;