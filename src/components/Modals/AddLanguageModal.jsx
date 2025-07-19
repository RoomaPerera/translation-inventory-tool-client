import React, { useState } from 'react';

const AddLanguageModal = ({ 
  isOpen, 
  onClose, 
  allLanguages = [], 
  projectLanguages = [], 
  selectedProject, 
  onLanguageAssign 
}) => {
    const [selectedLanguageIds, setSelectedLanguageIds] = useState([]);
    
    if (!isOpen) return null;

    // Get assigned language IDs for comparison
    // projectLanguages is an array of language ID strings from backend
    const assignedLanguageIds = Array.isArray(projectLanguages) ? projectLanguages : [];
    
    console.log('Project languages (assigned IDs):', assignedLanguageIds);
    console.log('All languages:', allLanguages);

    // Handle individual checkbox selection
    const handleLanguageToggle = (languageId) => {
        setSelectedLanguageIds(prev => {
            if (prev.includes(languageId)) {
                return prev.filter(id => id !== languageId);
            } else {
                return [...prev, languageId];
            }
        });
    };

    // Handle batch assignment of selected languages
    const handleAssignSelectedLanguages = () => {
        if (selectedLanguageIds.length > 0) {
            onLanguageAssign(selectedLanguageIds); // Pass array of IDs
            setSelectedLanguageIds([]); // Clear selection after assignment
        }
    };

    // Filter out already assigned languages
    const availableLanguages = allLanguages.filter(lang => !assignedLanguageIds.includes(lang._id));

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 bg-brand-purple-base text-white">
                    <div>
                        <h2 className="text-lg font-semibold">Add Language</h2>
                        <div className="text-xs opacity-80">
                            {selectedProject ? selectedProject.name : 'No Project Selected'}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold leading-none">×</button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                    <h3 className="text-base font-semibold mb-3">Select Languages to Assign</h3>
                    
                    {availableLanguages.length === 0 ? (
                        <p className="text-gray-500">All available languages are already assigned to this project</p>
                    ) : (
                        <>
                            <div className="max-h-64 overflow-y-auto mb-4">
                                {availableLanguages.map((language, index) => (
                                    <div 
                                        key={language._id}
                                        className={`flex items-center py-3 px-2 hover:bg-gray-50 rounded cursor-pointer ${
                                            index < availableLanguages.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                        onClick={() => handleLanguageToggle(language._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguageIds.includes(language._id)}
                                            onChange={() => handleLanguageToggle(language._id)}
                                            className="w-4 h-4 text-brand-purple-base bg-gray-100 border-gray-300 rounded focus:ring-brand-purple-base focus:ring-2"
                                        />
                                        <label className="ml-3 text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                            <span className="font-semibold">{language.code}</span>
                                            <span className="text-gray-500 ml-1">- {language.name}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Assignment Button */}
                            {selectedLanguageIds.length > 0 && (
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        {selectedLanguageIds.length} language{selectedLanguageIds.length > 1 ? 's' : ''} selected
                                    </p>
                                    <button 
                                        className="bg-brand-purple-base text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                                        onClick={handleAssignSelectedLanguages}
                                    >
                                        Assign Languages
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddLanguageModal;