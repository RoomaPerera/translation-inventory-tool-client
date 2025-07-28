import React, { useState, useEffect } from 'react';
import { useLanguages } from '../hooks/useLanguages';
import projectService from '../services/projectService';
import '../styles/modal.css';

const AssignProjectLanguageModal = ({ isOpen, onClose, project, onSuccess }) => {
    const { languages: availableLanguages, loading, error: langError } = useLanguages();
    const [assignedLanguages, setAssignedLanguages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // When the modal opens, get the current project languages
        if (isOpen && project) {
            fetchProjectLanguages();
            setError('');
            setSuccessMessage(''); // Clear any previous messages
        }
    }, [isOpen, project]);

    const fetchProjectLanguages = async () => {
        try {
            const response = await projectService.getProjectLanguages(project._id);
            const languageCodes = response.data.languages.map(lang => lang.code);
            setAssignedLanguages(languageCodes);
        } catch (err) {
            console.error('Error fetching project languages:', err);
            setAssignedLanguages(project?.languages || []);
        }
    };

    if (!isOpen || !project) return null;

    const toggleLanguage = (code) => {
        setAssignedLanguages(prev =>
            prev.includes(code) ? prev.filter(langCode => langCode !== code) : [...prev, code]
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            await projectService.assignLanguagesToProject(project._id, assignedLanguages);
            setSuccessMessage("Project languages updated successfully!");
            onSuccess && onSuccess();
            // Auto-close the modal after a brief delay to show the success message
            setTimeout(() => {
                onClose();
                setSuccessMessage('');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save project languages.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Assign Languages to Project</h2>
                        <div className="subtitle">Project: {project.name}</div>
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
                    {successMessage && <p className="text-green-600 text-sm mr-auto font-medium">{successMessage}</p>}
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

export default AssignProjectLanguageModal;
