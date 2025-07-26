import React from 'react';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';

const HomeToolbar = ({ filters, onFilterChange, onAddNewTranslation }) => {
    const langOptions = [
        { value: '', label: 'All Languages' },
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
        { value: 'ar', label: 'Arabic' },
    ];
    const showOptions = [{ value: 'all', label: 'Show All Entries' }];
    const typeOptions = [{ value: 'translations', label: 'Translations' }];

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-5">
      <Button
        onClick={onAddNewTranslation}
        className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3 mr-4"
      >
        + Add new Translation
      </Button>
      <div className="w-48 mr-4">
        <Select options={showOptions} selected={'all'} onSelect={() => {}} />
      </div>
      <div className="w-48 mr-4">
        <Select
            options={langOptions}
            selected={filters.language}
            onSelect={(value) => onFilterChange('language', value)}
        />
      </div>
      <div className="w-48 mr-4">
        <Select options={typeOptions} selected={'translations'} onSelect={() => {}} />
      </div>
      <Button className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3">
        Download
      </Button>
      <div className="flex items-center ml-auto">
        <input type="radio" id="json" name="format" value="JSON" className="mr-1.5 h-4 w-4" />
        <label htmlFor="json" className="mr-4 text-sm">JSON</label>
        <input type="radio" id="csv" name="format" value="CSV" className="mr-1.5 h-4 w-4" />
        <label htmlFor="csv" className="text-sm">CSV</label>
      </div>
    </div>
  );
};

export default HomeToolbar;