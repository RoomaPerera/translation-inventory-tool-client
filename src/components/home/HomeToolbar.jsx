//import React from 'react';
import React, { useState, useEffect } from 'react';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';
import { useLanguages } from '../../hooks/useLanguages';

const HomeToolbar = ({ user, filters, onFilterChange, onAddNewTranslation }) => {
    const { languages, loading: languagesLoading } = useLanguages();
    
    // Create dynamic language options from fetched languages
    const langOptions = [
        { value: '', label: 'All Languages' },
        ...languages.map(lang => ({
            value: lang.code,
            label: `${lang.name} (${lang.code.toUpperCase()})`
        }))
    ];
    const showOptions = [
        { value: 'all', label: 'Show All Entries' },
        { value: 'pending', label: 'Pending Translations' },
        { value: 'approved', label: 'Approved Translations' }
    ];
    const typeOptions = [{ value: 'translations', label: 'Translations' }];

    // Handle language selection
    const handleLanguageSelect = (value) => {
        console.log('HomeToolbar: Language selected:', value);
        setSelectedLanguage(value);
        if (onLanguageFilter) {
            onLanguageFilter(value);
        }
    };

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-5">
      {/* Only show Add New Translation button for Admin and Developer */}
      {user && (user.role === 'Admin' || user.role === 'Developer') && (
        <Button
          onClick={onAddNewTranslation}
          className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3 mr-4"
        >
          + Add new Translation
        </Button>
      )}
      <div className="w-48 mr-4">
        <Select 
          options={showOptions} 
          selected={filters.status || 'all'} 
          onSelect={(value) => onFilterChange('status', value)} 
        />
      </div>
      
        <div className="w-48 mr-4">
          <Select
              options={languagesLoading ? [{ value: '', label: 'Loading languages...' }] : langOptions}
              selected={filters.language}
              onSelect={(value) => onFilterChange('language', value)}
              disabled={languagesLoading}
          />
        </div>
      
      
      
      {/* Only show Language dropdown for Admin and Developer 
      {user && (user.role === 'Admin' || user.role === 'Developer') && (
        <div className="w-48 mr-4">
          <Select options={typeOptions} selected={'translations'} onSelect={() => {}} />
        </div> )} */}
      
      {/* Only show Download button and JSON/CSV radio buttons for Admin and Developer */}
      {user && (user.role === 'Admin' || user.role === 'Developer') && (
        <div className="flex items-center ml-auto">
          <input type="radio" id="json" name="format" value="JSON" className="mr-1.5 h-4 w-4" />
          <label htmlFor="json" className="mr-4 text-sm">JSON</label>
          <input type="radio" id="csv" name="format" value="CSV" className="mr-1.5 h-4 w-4" />
          <label htmlFor="csv" className="mr-4 text-sm">CSV</label>
          <Button className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3">
            Download
          </Button>
        </div> 
      )} 
    </div>
  );
};

export default HomeToolbar;