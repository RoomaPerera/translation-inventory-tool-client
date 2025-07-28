import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import TranslationHelper from './home/TranslationHelper';
import nlpService from '../services/nlpService';
import translationService from '../services/translationService';
import axios from 'axios';
import '../styles/modal.css';

const EditTranslationModal = ({ isOpen, onClose, onSave, translation }) => {
  const [formData, setFormData] = useState({
    translationKey: '',
    translatedText: '',
    status: 'pending',
    product: ''
  });

  const [suggestions, setSuggestions] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [isLoadingNlp, setIsLoadingNlp] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quality Check state
  const [qualityCheckLoading, setQualityCheckLoading] = useState(false);
  const [qualityCheckResult, setQualityCheckResult] = useState(null);
  const [qualityCheckError, setQualityCheckError] = useState('');

  const debouncedKey = useDebounce(formData.translationKey, 500);

  useEffect(() => {
    if (translation) {
      setFormData({
        translationKey: translation.translationKey || '',
        translatedText: translation.translatedText || '',
        status: translation.status || 'pending',
        product: translation.product || 'Rubix'
      });
      setSuggestions([]);
      setGlossary([]);
      setQualityCheckResult(null);
      setQualityCheckError('');
    }
  }, [translation]);

useEffect(() => {
  if (qualityCheckResult) {
    console.log("Quality Check Result:", qualityCheckResult);
  }
}, [qualityCheckResult]);

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
    setQualityCheckResult(null);
    setQualityCheckError('');
  };

  const handleSuggestionClick = (text) => {
    setFormData({ ...formData, translatedText: text });
    setQualityCheckResult(null);
    setQualityCheckError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    const updateData = {
      translatedText: formData.translatedText,
      status: formData.status
    };

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

  const runQualityCheck = async () => {
    setQualityCheckError('');
    setQualityCheckResult(null);
    setQualityCheckLoading(true);
    const token = localStorage.getItem('token'); // or sessionStorage

    try {
      const response = await axios.post(
        '/api/translations/quality-check',
        {
          inputText: formData.translationKey,
          translatedText: formData.translatedText,
          expectedTargetLanguage: translation?.language || ''
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setQualityCheckResult(response.data);
    } catch (err) {
      setQualityCheckError(err.response?.data?.error || 'Quality check failed');
    } finally {
      setQualityCheckLoading(false);
    }
  };

  const modalStyle = {
    width: '800px',
    maxWidth: '90vw'
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Edit Translation</h2>
            <div className="subtitle">
              {formData.product}: {translation?.translationKey} ({translation?.language?.toUpperCase()})
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">×</button>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Form */}
          <div className="modal-body !p-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Translation Key (Source Text)
                  </label>
                  <input
                    type="text"
                    value={formData.translationKey}
                    readOnly
                    className="w-full p-2 bg-gray-100 border-b-2 border-gray-300"
                  />
                </div>

                <textarea
                  name="translatedText"
                  placeholder="Translated Text"
                  rows="4"
                  value={formData.translatedText}
                  onChange={handleChange}
                  className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base"
                  required
                />

{//---------------------------------------------
}

                {/* Translation Quality Check */}
                <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-bold text-indigo-700">Translation Quality Check</h3>


                  <button
                    type="button"
                    onClick={runQualityCheck}
                    disabled={qualityCheckLoading || !formData.translationKey || !formData.translatedText}
                    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {qualityCheckLoading ? 'Checking...' : 'Check Quality'}
                  </button>

                  {qualityCheckError && (
                    <p className="text-red-600 mt-2">{qualityCheckError}</p>
                  )}

                

                  {qualityCheckResult && (
                    <div className="mt-4 bg-gray-50 p-3 rounded space-y-1">
                      <p><strong>Detected Target Language:</strong> {qualityCheckResult.detectedTargetLanguage}</p>
                      <p>
                        <strong>Language Match:</strong>{' '}
                        <span className={qualityCheckResult.languageMatch ? "text-green-600" : "text-red-600"}>
                          {qualityCheckResult.languageMatch ? "Yes" : "No"}
                        </span>
                      </p>
                      <p>
                        <strong>Translation Match:</strong>{' '}
                        <span className={qualityCheckResult.checkPassed ? "text-green-600" : "text-red-600"}>
                          {qualityCheckResult.checkPassed ? "Yes" : "No"}
                        </span>
                      </p>
                      
                      <p><strong>Score:</strong> {qualityCheckResult.score}</p>
                      <p><strong>Marks:</strong> {qualityCheckResult.marks}</p>
                    </div>
                  )}
                </div>
                {/* //================================= */}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border bg-white rounded-md border-gray-300 focus:outline-none focus:border-brand-purple-base"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <div className="flex justify-end gap-4 mt-auto pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Translation Helper */}
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
