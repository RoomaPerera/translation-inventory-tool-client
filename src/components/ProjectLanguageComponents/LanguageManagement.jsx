import React, { useState } from 'react';
import FuzzySearchInput from '../reusableComponents/FuzzySearchInput';

const DeleteLanguageModal = ({ language, isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !language) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Language
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the language 
            <span className="font-semibold text-gray-900"> "{language.name || language.code}" ({language.code})</span>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This will remove the language from all projects that currently use it. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(language)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isDeleting ? 'Deleting...' : 'Delete Language'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LanguageManagement = ({ languages, isLoadingLanguages, onAddLanguage, onDeleteLanguage, onEditLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, language: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredLanguage, setHoveredLanguage] = useState(null);

  const filteredLanguages = languages.filter(lang =>
    lang.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lang.name && lang.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (language, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, language });
  };

  const handleEditClick = (language, e) => {
    e.stopPropagation();
    if (onEditLanguage) {
      onEditLanguage(language);
    }
  };

  const handleDeleteConfirm = async (language) => {
    setIsDeleting(true);
    try {
      if (onDeleteLanguage) {
        await onDeleteLanguage(language);
      }
      setDeleteModal({ isOpen: false, language: null });
    } catch (error) {
      console.error('Failed to delete language:', error);
      // Handle error (you might want to show an error message)
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, language: null });
    }
  };

  return (
    <>
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
              <h3 className="text-md font-medium">
                Available Languages
                {languages.length > 0 && (
                  <span className="text-sm text-gray-500 ml-2">({languages.length} total)</span>
                )}
              </h3>
              <div className="w-64">
                <FuzzySearchInput
                  placeholder="Search languages..."
                  searchType="language"
                  onQueryChange={(value) => setSearchTerm(value)}
                  onResultSelect={(result) => {
                    // When a fuzzy search result is selected, set the search term to the language value
                    setSearchTerm(result.displayValue || result.language || result.matchedField);
                  }}
                  className="w-full"
                  
                />
              </div>
            </div>

            {isLoadingLanguages ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredLanguages.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {searchTerm ? `Found ${filteredLanguages.length} language(s)` : `Showing all ${filteredLanguages.length} languages`}
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Clear search
                    </button>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {filteredLanguages.map((language) => (
                    <div 
                      key={language._id} 
                      className="relative group bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md flex items-center transition-all duration-200 hover:bg-indigo-200 hover:shadow-sm"
                      onMouseEnter={() => setHoveredLanguage(language._id)}
                      onMouseLeave={() => setHoveredLanguage(null)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{language.code}</span>
                        {language.name && <span className="ml-1 text-sm">- {language.name}</span>}
                      </div>
                      
                      {/* Action buttons - shows on hover */}
                      {hoveredLanguage === language._id && (
                        <div className="ml-2 flex items-center space-x-1">
                          {/* Edit button */}
                          <button
                            onClick={(e) => handleEditClick(language, e)}
                            className="p-1 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-150"
                            title={`Edit ${language.name || language.code}`}
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                              />
                            </svg>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteClick(language, e)}
                            className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors duration-150"
                            title={`Delete ${language.name || language.code}`}
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {/* Hover indicator */}
                      {hoveredLanguage === language._id && (
                        <div className="absolute inset-0 bg-indigo-200 bg-opacity-30 rounded-md pointer-events-none"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-2">No languages found matching "{searchTerm}"</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-800 underline text-sm"
                    >
                      Clear search to see all languages
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">No languages available.</p>
                    <button 
                      onClick={onAddLanguage}
                      className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add your first language
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Language Modal */}
      <DeleteLanguageModal
        language={deleteModal.language}
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default LanguageManagement;