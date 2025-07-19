import React, { useState } from 'react';

const Toolbar = ({ 
  onAddNewTranslationClick, 
  projectLanguages = [], 
  allLanguages = [],
  onDownload,
  onRefresh 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // projectLanguages now contains full language objects from the backend
  const languageObjects = projectLanguages;

  const handleDownload = () => {
    onDownload(selectedFormat);
  };

  const handleLanguageFilter = (e) => {
    setSelectedLanguage(e.target.value);
    // This could be extended to filter translations by selected language
  };

  return (
    <div className="content-toolbar">
      <button 
        className="toolbar-button"
        onClick={onAddNewTranslationClick}
      >
        + Add new Translation
      </button>
      
      <div className="custom-select">
        <select>
          <option>Show All Entries</option>
        </select>
      </div>
      
      <div className="custom-select">
        <select value={selectedLanguage} onChange={handleLanguageFilter}>
          <option value="all">All Languages ({languageObjects.length})</option>
          {languageObjects.length > 0 ? (
            languageObjects.map(lang => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))
          ) : (
            <option value="" disabled>No languages assigned</option>
          )}
        </select>
      </div>
      
      <div className="custom-select">
        <select>
          <option>Translations</option>
        </select>
      </div>
      
      <button className="toolbar-button" onClick={handleDownload}>
        Download
      </button>
      
      {onRefresh && (
        <button className="toolbar-button" onClick={onRefresh}>
          🔄 Refresh
        </button>
      )}
      
      <div className="radio-group">
        <input 
          type="radio" 
          id="json" 
          name="format" 
          value="json" 
          checked={selectedFormat === 'json'}
          onChange={(e) => setSelectedFormat(e.target.value)}
        />
        <label htmlFor="json">JSON Format</label>
        
        <input 
          type="radio" 
          id="csv" 
          name="format" 
          value="csv" 
          checked={selectedFormat === 'csv'}
          onChange={(e) => setSelectedFormat(e.target.value)}
        />
        <label htmlFor="csv">CSV</label>
      </div>
    </div>
  );
};

export default Toolbar;