import React from 'react';

const Toolbar = ({ onAddNewTranslationClick }) => {
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
          <select>
              <option>All Languages</option>
          </select>
      </div>
      <div className="custom-select">
          <select>
              <option>Translations</option>
          </select>
      </div>
      <button className="toolbar-button">Download</button>
      <div className="radio-group">
          <input type="radio" id="json" name="format" value="JSON" defaultChecked />
          <label htmlFor="json">JSON Format</label>
          <input type="radio" id="csv" name="format" value="CSV" />
          <label htmlFor="csv">CSV</label>
      </div>
    </div>
  );
};

export default Toolbar;