import React, { useState } from 'react';

const AssignLanguageModal = ({ 
  isOpen, 
  onClose, 
  allLanguages = [], 
  projectLanguages = [], 
  selectedProject, 
  onLanguageAssign 
}) => {
    const [selectedLanguageIds, setSelectedLanguageIds] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    
    if (!isOpen) return null;

    // Get assigned language IDs for comparison - handle multiple ID formats
    const assignedLanguageIds = Array.isArray(projectLanguages) 
        ? projectLanguages.map(lang => {
            // Handle different possible ID formats
            if (typeof lang === 'string') return lang;
            return lang._id || lang.id || lang.languageId;
        }).filter(Boolean) // Remove any undefined/null values
        : [];
    
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
    const handleAssignSelectedLanguages = async () => {
        if (selectedLanguageIds.length > 0) {
            setIsAssigning(true);
            try {
                await onLanguageAssign(selectedLanguageIds);
                setSelectedLanguageIds([]);
                onClose();
            } catch (error) {
                console.error('Error assigning languages:', error);
            } finally {
                setIsAssigning(false);
            }
        }
    };

    // Check if a language is already assigned - more robust checking
    const isLanguageAssigned = (language) => {
        const languageId = language._id || language.id;
        return assignedLanguageIds.some(assignedId => 
            String(assignedId) === String(languageId)
        );
    };

    // Get available (unassigned) languages count
    const availableLanguages = allLanguages.filter(lang => !isLanguageAssigned(lang));

    // Handle backdrop click to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        // Backdrop
        <div 
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={handleBackdropClick}
        >
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 bg-purple-600 text-white">
                    <div>
                        <h2 className="text-lg font-semibold">Assign Languages to Project</h2>
                        <div className="text-xs opacity-80">
                            {selectedProject ? selectedProject.name : 'No Project Selected'}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-2xl font-bold leading-none hover:bg-white hover:bg-opacity-20 rounded px-2 py-1 transition-colors"
                        disabled={isAssigning}
                    >
                        ×
                    </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                    {!selectedProject ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Please select a project first to assign languages.</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-base font-semibold mb-3">Available Languages</h3>
                            
                            {allLanguages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No languages available in the system.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-64 overflow-y-auto mb-4">
                                        {allLanguages.map((language, index) => {
                                            const languageId = language._id || language.id;
                                            const isAssigned = isLanguageAssigned(language);
                                            const isSelected = selectedLanguageIds.includes(languageId);
                                            
                                            return (
                                                <div 
                                                    key={languageId}
                                                    className={`flex items-center py-3 px-2 rounded transition-colors ${
                                                        isAssigned 
                                                            ? 'bg-gray-100 cursor-not-allowed' 
                                                            : 'hover:bg-gray-50 cursor-pointer'
                                                    } ${index < allLanguages.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                    onClick={() => !isAssigned && !isAssigning && handleLanguageToggle(languageId)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={isAssigned || isAssigning}
                                                        onChange={() => handleLanguageToggle(languageId)}
                                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className={`text-sm font-medium ${isAssigned ? 'text-gray-500' : 'text-gray-700'}`}>
                                                            <span className="font-semibold">{language.code || 'N/A'}</span>
                                                            <span className="ml-1">- {language.name || 'Unnamed'}</span>
                                                        </div>
                                                        {isAssigned && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                Already assigned to this project
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isAssigned && (
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                            Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Assignment Button */}
                                    {selectedLanguageIds.length > 0 && (
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                {selectedLanguageIds.length} language{selectedLanguageIds.length > 1 ? 's' : ''} selected
                                            </p>
                                            <button 
                                                className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                onClick={handleAssignSelectedLanguages}
                                                disabled={isAssigning}
                                            >
                                                {isAssigning ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                        Assigning...
                                                    </>
                                                ) : (
                                                    'Assign Languages'
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Languages Summary */}
                                    <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="font-medium">Available:</span> {availableLanguages.length}
                                            </div>
                                            <div>
                                                <span className="font-medium">Assigned:</span> {assignedLanguageIds.length}
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium">Total:</span> {allLanguages.length}
                                            </div>
                                        </div>
                                    </div>

                                    {/* No available languages message */}
                                    {availableLanguages.length === 0 && allLanguages.length > 0 && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                                            <p className="text-sm text-green-700 font-medium">
                                                ✅ All languages are already assigned to this project!
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={isAssigning}
                    >
                        {selectedLanguageIds.length > 0 && !isAssigning ? 'Cancel' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignLanguageModal;