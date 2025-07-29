import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import nlpService from '../services/nlpService';
import translationService from '../services/translationService';
import SuggestionPanel from './home/SuggestionPanel'; // <-- CORRECT IMPORT
import '../styles/modal.css';

const EditTranslationModal = ({ isOpen, onClose, onSave, translation, projects = [], currentUser }) => {
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingNlp, setIsLoadingNlp] = useState(false);
  const debouncedKey = useDebounce(formData.translationKey, 500);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // State for tab navigation
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    if (translation) {
      setFormData({
        translationKey: translation.translationKey || '',
        translatedText: translation.translatedText || '',
        status: translation.status || 'pending',
        product: translation.product || 'Rubix'
      });
      setActiveTab("edit"); // Reset to edit tab when modal opens
      setSuggestions([]);
    }
  }, [translation]);

  useEffect(() => {
    // Only fetch suggestions when on edit tab and key exists
    if (debouncedKey && activeTab === "edit") {
      const fetchNlpData = async () => {
        setIsLoadingNlp(true);
        try {
          const suggestRes = await nlpService.getSuggestions(debouncedKey, formData.product, translation.projectId);
          setSuggestions(suggestRes.data.suggestions || []);
        } catch (nlpError) {
          setSuggestions([]);
        } finally {
          setIsLoadingNlp(false);
        }
      };
      fetchNlpData();
    } else {
      setSuggestions([]);
    }
  }, [debouncedKey, formData.product, translation?.projectId, activeTab]);

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
    
    const updateData = { translatedText: formData.translatedText };
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Developer')) {
        updateData.status = formData.status;
    }

    try {
      await translationService.updateTranslation(translation._id, updateData);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update translation.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const modalStyle = { width: '800px', maxWidth: '90vw' };
  if (!isOpen) return null;

  const currentProject = projects.find(p => p._id === translation?.projectId) || null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Translation</h2>
            <div className="subtitle">{currentProject ? currentProject.name : 'Unknown Project'} | {translation?.language?.toUpperCase() || 'Unknown'}</div>
          </div>
          <button onClick={onClose} className="modal-close-button">×</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-brand-purple-base text-brand-purple-base"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Edit Translation
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-brand-purple-base text-brand-purple-base"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Version History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "edit" ? (
          // Edit Translation Tab Content
          <div className="grid grid-cols-2 gap-6 p-6">
            <div className="modal-body !p-0">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-5">
                  <div>
                     <label className="block text-sm font-medium text-gray-500 mb-1">Translation Key (Source Text)</label>
                     <input type="text" value={formData.translationKey} readOnly className="w-full p-2 bg-gray-100 border-b-2 border-gray-300" />
                  </div>
                  <textarea name="translatedText" placeholder="Translated Text" rows="4" value={formData.translatedText} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />
                  {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Developer') && (
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
            <div className="flex flex-col gap-4">
              <SuggestionPanel suggestions={suggestions} onSuggestionClick={handleSuggestionClick} isLoading={isLoadingNlp} />
            </div>
          </div>
        ) : (
          // Version History Tab Content
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📝</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Version History</h3>
              <p className="text-gray-500">Version history feature coming soon...</p>
              <p className="text-sm text-gray-400 mt-2">Track changes and revisions made to this translation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTranslationModal;