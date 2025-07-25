import React, { useState } from 'react';

const LanguageManagement = ({ languages, isLoadingLanguages, onAddLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lang.name && lang.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="space-y-4">
        {/* Add Language Button */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onAddLanguage}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Language
          </button>
        </div>

        {/* Available Languages Header + Search */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">Available Languages</h3>
            <input 
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {isLoadingLanguages ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {filteredLanguages.map((language) => (
                <div 
                  key={language._id} 
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md flex items-center"
                >
                  <span className="font-medium">{language.code}</span>
                  {language.name && <span className="ml-1 text-sm">- {language.name}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No languages found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageManagement;
