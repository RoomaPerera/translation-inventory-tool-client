import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce'; // Import our new hook
import TranslationHelper from './home/TranslationHelper'; // Import our new component
import nlpService from '../services/nlpService';
import translationService from '../services/translationService';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/modal.css';

const AddTranslationModal = ({ isOpen, onClose, onSave }) => {
    const { user } = useAuthContext();
    const [formData, setFormData] = useState({
        translationKey: '',
        language: '',
        translatedText: '',
        product: 'Rubix', // Default product
    });

    // State for the Translation Helper
    const [suggestions, setSuggestions] = useState([]);
    const [glossary, setGlossary] = useState([]);
    const [isLoadingNlp, setIsLoadingNlp] = useState(false);
    const debouncedKey = useDebounce(formData.translationKey, 500); // Debounce the source text field

    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // This effect runs when the debounced value of `translationKey` changes
        if (debouncedKey) {
            const fetchNlpData = async () => {
                setIsLoadingNlp(true);
                try {
                    // Fire both API calls in parallel
                    const [suggestRes, glossaryRes] = await Promise.all([
                        nlpService.getSuggestions(debouncedKey, formData.product),
                        nlpService.getGlossary(debouncedKey)
                    ]);
                    setSuggestions(suggestRes.data.suggestions || []);
                    setGlossary(glossaryRes.data.glossary || []);
                } catch (nlpError) {
                    console.error("Failed to fetch NLP data:", nlpError);
                    setSuggestions([]); // Clear previous results on error
                    setGlossary([]);
                } finally {
                    setIsLoadingNlp(false);
                }
            };
            fetchNlpData();
        } else {
            // Clear results if the input is empty
            setSuggestions([]);
            setGlossary([]);
        }
    }, [debouncedKey, formData.product]); // Re-run if the key or product changes

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // When a user clicks a suggestion, update the `translatedText` field
    const handleSuggestionClick = (text) => {
        setFormData({ ...formData, translatedText: text });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        const submissionData = { ...formData, createdBy: user?.userName || 'System' };

        try {
            await translationService.addTranslation(submissionData);
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add translation.');
        } finally {
            setIsSaving(false);
        }
    };

    // We need to widen the modal to accommodate the two columns
    const modalStyle = {
        width: '800px',
        maxWidth: '90vw'
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Add New Translation</h2>
                        <div className="subtitle">{formData.product}</div>
                    </div>
                    <button onClick={onClose} className="modal-close-button">×</button>
                </div>
                {/* Use a grid layout for the form and the helper */}
                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Column 1: The Form */}
                    <div className="modal-body !p-0">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="space-y-5">
                                <input name="translationKey" placeholder="Translation Key (Source Text)" value={formData.translationKey} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />
                                <input name="language" placeholder="Language Code (e.g., en, es, fr)" value={formData.language} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />
                                <textarea name="translatedText" placeholder="Translated Text" rows="4" value={formData.translatedText} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />
                            </div>

                            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                            <div className="flex justify-end gap-4 mt-auto pt-6">
                                <button type="button" onClick={onClose} className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={isSaving} className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Translation'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Column 2: The Helper */}
                    <div>
                        <TranslationHelper
                            suggestions={suggestions}
                            glossary={glossary}
                            onSuggestionClick={handleSuggestionClick}
                            isLoading={isLoadingNlp}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTranslationModal;