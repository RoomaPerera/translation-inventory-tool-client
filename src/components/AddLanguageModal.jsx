import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLanguages } from '../hooks/useLanguages'; // To get available languages
import userService from '../services/userService'; // To save the changes
import '../styles/modal.css';

const AddLanguageModal = ({ isOpen, onClose }) => {
    const { user } = useAuthContext();
    const { languages: availableLanguages, loading, error: langError } = useLanguages();
    const [assignedLanguages, setAssignedLanguages] = useState(user?.languages || []);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // When the modal opens, set the state to the user's current languages
        if (isOpen) {
            setAssignedLanguages(user?.languages || []);
        }
    }, [isOpen, user]);
    
    if (!isOpen) return null;

    const toggleLanguage = (code) => {
        setAssignedLanguages(prev => 
            prev.includes(code) ? prev.filter(langCode => langCode !== code) : [...prev, code]
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        try {
            await userService.assignLanguagesToUser(user._id, assignedLanguages);
            // Optionally, refresh user context here if languages are needed immediately elsewhere
            alert("Languages updated successfully!");
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save languages.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Assign Your Languages</h2>
                        <div className="subtitle">User: {user.userName}</div>
                    </div>
                    <button onClick={onClose} className="modal-close-button">×</button>
                </div>
                <div className="modal-body">
                    {loading && <p>Loading available languages...</p>}
                    {langError && <p className="text-red-500">{langError}</p>}
                    {!loading && !langError && (
                        <ul className="list-none p-0 m-0 max-h-80 overflow-y-auto">
                            {availableLanguages.map((lang) => (
                                <li key={lang.code} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                    <span className="text-base">{lang.name} ({lang.code.toUpperCase()})</span>
                                    <button 
                                        onClick={() => toggleLanguage(lang.code)}
                                        className={`text-xs font-bold py-1 px-4 rounded-full ${assignedLanguages.includes(lang.code) 
                                            ? "bg-green-500 text-white" 
                                            : "bg-white border border-gray-400 text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        {assignedLanguages.includes(lang.code) ? 'Assigned' : 'Assign'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end items-center gap-4">
                     {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
                    <button onClick={onClose} className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={handleSaveChanges} disabled={isSaving} className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddLanguageModal;