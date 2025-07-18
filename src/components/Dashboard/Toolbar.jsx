import React from 'react';

const Toolbar = ({ onAddNewTranslationClick }) => {
  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-5">
      <button 
        className="bg-gray-100 border border-gray-300 py-2 px-3 rounded-md text-sm font-medium cursor-pointer mr-4 hover:bg-gray-200"
        onClick={onAddNewTranslationClick}
      >
        + Add new Translation
      </button>
      
      {/* Keeping native selects but with Tailwind-friendly styling */}
      <select className="border border-gray-300 rounded-md py-2 px-3 text-sm mr-4">
        <option>Show All Entries</option>
      </select>
      <select className="border border-gray-300 rounded-md py-2 px-3 text-sm mr-4">
        <option>All Languages</option>
      </select>
      <select className="border border-gray-300 rounded-md py-2 px-3 text-sm mr-4">
        <option>Translations</option>
      </select>

      <button className="bg-gray-100 border border-gray-300 py-2 px-3 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-200">
        Download
      </button>

      <div className="flex items-center ml-4">
        <input type="radio" id="json" name="format" value="JSON" className="mr-1.5" defaultChecked />
        <label htmlFor="json" className="mr-4 text-sm">JSON Format</label>
        
        <input type="radio" id="csv" name="format" value="CSV" className="mr-1.5" />
        <label htmlFor="csv" className="text-sm">CSV</label>
      </div>
    </div>
  );
};

export default Toolbar;