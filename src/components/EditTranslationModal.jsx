import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce'; // Import the debounce hook
import TranslationHelper from './home/TranslationHelper'; // Import the helper panel
import nlpService from '../services/nlpService';
import translationService from '../services/translationService';
import '../styles/modal.css';

const EditTranslationModal = ({ isOpen, onClose, onSave, translation, projects = [], currentUser }) => {
  // Form state, pre-filled from the `translation` prop
  const [formData, setFormData] = useState({
    translationKey: '',
    translatedText: '',
    status: 'pending',
    product: ''
  });

  // State for the Translation Helper
  const [suggestions, setSuggestions] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [isLoadingNlp, setIsLoadingNlp] = useState(false);
  
  // We will debounce the `translationKey` from our form's state
  const debouncedKey = useDebounce(formData.translationKey, 500);

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Effect to populate the form when the modal opens or the `translation` prop changes
  useEffect(() => {
    if (translation) {
      setFormData({
        translationKey: translation.translationKey || '',
        translatedText: translation.translatedText || '',
        status: translation.status || 'pending',
        product: translation.product || 'Rubix'
      });
      // Clear old NLP results when a new translation is loaded
      setSuggestions([]);
      setGlossary([]);
    }
  }, [translation]);

  // Effect to fetch NLP data when the debounced source text (`translationKey`) changes
  useEffect(() => {
    if (debouncedKey) {
      const fetchNlpData = async () => {
        setIsLoadingNlp(true);
        try {
          const [suggestRes, glossaryRes] = await Promise.all([
            nlpService.getSuggestions(debouncedKey, formData.product),
            nlpService.getGlossary(debouncedKey)
          ]);
          setSuggestions(suggestRes.data.suggestions || []);
          setGlossary(glossaryRes.data.glossary || []);
        } catch (nlpError) {
          console.error("Failed to fetch NLP data:", nlpError);
          setSuggestions([]);
          setGlossary([]);
        } finally {
          setIsLoadingNlp(false);
        }
      };
      fetchNlpData();
    } else {
      setSuggestions([]);
      setGlossary([]);
    }
  }, [debouncedKey, formData.product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestionClick = (text) => {
    setFormData({ ...formData, translatedText: text });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    // We only send the fields that can be updated
    const updateData = {
        translatedText: formData.translatedText
    };

    // Only include status update for Admin and Developer roles
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'admin' || currentUser.role === 'Developer' || currentUser.role === 'developer')) {
        updateData.status = formData.status;
    }

    try {
      await translationService.updateTranslation(translation._id, updateData);
      onSave(); // Refresh the list
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update translation.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Widen the modal for the two-column layout
  const modalStyle = {
      width: '800px',
      maxWidth: '90vw'
  };

  if (!isOpen) return null;

  // Find the project for this translation
  const currentProject = projects.find(p => p._id === translation?.projectId) || null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Translation</h2>
            <div className="subtitle">
              {currentProject ? currentProject.name : 'Unknown Project'} | {translation?.language?.toUpperCase() || 'Unknown Language'}
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">×</button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Column 1: The Form */}
          <div className="modal-body !p-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="space-y-5">
                 {/* The translation key is read-only here as it shouldn't be changed during an edit */}
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Translation Key (Source Text)</label>
                   <input type="text" value={formData.translationKey} readOnly className="w-full p-2 bg-gray-100 border-b-2 border-gray-300" />
                </div>
                
                <textarea name="translatedText" placeholder="Translated Text" rows="4" value={formData.translatedText} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />

                {/* Only show status dropdown for Admin and Developer roles */}
                {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'admin' || currentUser.role === 'Developer' || currentUser.role === 'developer') && (
                  <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border bg-white rounded-md border-gray-300 focus:outline-none focus:border-brand-purple-base">
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                      </select>
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              
              <div className="flex justify-end gap-4 mt-auto pt-6">
                  <button type="button" onClick={onClose} className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={isSaving} className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50">
                      {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
              </div>
            </form>
          </div>
          
          {/* Column 2: The Helper Panel */}
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

export default EditTranslationModal;