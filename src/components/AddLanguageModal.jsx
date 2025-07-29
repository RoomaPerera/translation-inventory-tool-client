import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import nlpService from '../services/nlpService';
import translationService from '../services/translationService';
import projectService from '../services/projectService';
import { useAuthContext } from '../hooks/useAuthContext';
import { Select } from './reusableComponents/Select';
import SuggestionPanel from './home/SuggestionPanel'; // <-- CORRECT IMPORT
import GlossaryPanel from './home/GlossaryPanel';   // <-- CORRECT IMPORT
import '../styles/modal.css';

const AddTranslationModal = ({ isOpen, onClose, onSave, projectId, selectedProject }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    translationKey: "",
    language: "",
    translatedText: "",
    product: "General",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [isLoadingNlp, setIsLoadingNlp] = useState(false);
  const debouncedKey = useDebounce(formData.translationKey, 800);

  const [projectLanguages, setProjectLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        translationKey: "",
        language: "",
        translatedText: "",
        product: "General",
      });
      setError("");
      setSuggestions([]);
      setGlossary([]);
      if (projectId) {
        fetchProjectLanguages();
      }
    }
  }, [isOpen, projectId]);

  const fetchProjectLanguages = async () => {
    if (!projectId) {
      setProjectLanguages([]);
      return;
    }
    setIsLoadingLanguages(true);
    try {
      const response = await projectService.getProjectLanguages(projectId);
      const languages = response.data.languages || [];
      const languageOptions = [{ value: '', label: 'All Languages' }];
      languages.forEach(lang => {
        languageOptions.push({
          value: lang.code,
          label: `${lang.name} (${lang.code.toUpperCase()})`
        });
      });
      setProjectLanguages(languageOptions);
    } catch (err) {
      setError('Failed to load project languages');
      setProjectLanguages([]);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  useEffect(() => {
    if (debouncedKey && debouncedKey.length >= 3) {
      const fetchNlpData = async () => {
        setIsLoadingNlp(true);
        try {
          const [suggestRes, glossaryRes] = await Promise.allSettled([
            nlpService.getSuggestions(debouncedKey, formData.product, projectId),
            nlpService.getGlossary(debouncedKey, projectId)
          ]);
          setSuggestions(suggestRes.status === 'fulfilled' ? suggestRes.value.data.suggestions || [] : []);
          setGlossary(glossaryRes.status === 'fulfilled' ? glossaryRes.value.data.glossary || [] : []);
        } catch (nlpError) {
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
      setIsLoadingNlp(false);
    }
  }, [debouncedKey, formData.product, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSuggestionClick = (text) => {
    setFormData({ ...formData, translatedText: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    if (!projectId) {
      setError("Cannot save translation without a project ID.");
      setIsSaving(false);
      return;
    }

    if (!formData.translationKey.trim()) {
      setError("Translation Key is required.");
      setIsSaving(false);
      return;
    }

    if (projectLanguages.length === 0) {
      setError("This project has no languages assigned.");
      setIsSaving(false);
      return;
    }

    if (!formData.language) {
      try {
        const actualLanguages = projectLanguages.filter(lang => lang.value !== '');
        if (actualLanguages.length === 0) {
          setError("No languages available for bulk creation.");
          setIsSaving(false);
          return;
        }
        const translationsToCreate = actualLanguages.map(langOption => ({
          translationKey: formData.translationKey,
          language: langOption.value,
          translatedText: formData.translatedText || "",
          product: formData.product,
          createdBy: user?.userName || "System",
          projectId,
        }));
        await translationService.addBulkTranslations(translationsToCreate);
        onSave();
        onClose();
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to add translations.";
        setError(`Error: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const submissionData = { ...formData, createdBy: user?.userName || "System", projectId };
    try {
      await translationService.addTranslation(submissionData);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add translation.");
    } finally {
      setIsSaving(false);
    }
  };

  const modalStyle = { width: "800px", maxWidth: "90vw" };
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Add New Translation</h2>
            <div className="subtitle">{selectedProject ? selectedProject.name : 'No Project Selected'}</div>
          </div>
          <button onClick={onClose} className="modal-close-button">×</button>
        </div>
        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="modal-body !p-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="space-y-5">
                <input name="translationKey" placeholder="Translation Key (Source Text)" value={formData.translationKey} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" required />
                <div className="w-full">
                  <Select options={projectLanguages} selected={formData.language} onSelect={(value) => setFormData(prev => ({ ...prev, language: value }))} disabled={isLoadingLanguages || projectLanguages.length === 0} />
                  {!formData.language && projectLanguages.length > 0 && (<p className="text-sm text-blue-600 mt-1">Will create placeholders for all {projectLanguages.length - 1} languages</p>)}
                </div>
                <textarea name="translatedText" placeholder="Translated Text (Optional)" rows="4" value={formData.translatedText} onChange={handleChange} className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base" />
              </div>
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <div className="flex justify-end gap-4 mt-auto pt-6">
                <button type="button" onClick={onClose} className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={isSaving} className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50">
                  {isSaving ? "Saving..." : !formData.language && projectLanguages.length > 1 ? `Create for ${projectLanguages.length - 1} Languages` : "Save Translation"}
                </button>
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-4">
            <SuggestionPanel suggestions={suggestions} onSuggestionClick={handleSuggestionClick} isLoading={isLoadingNlp} />
            <GlossaryPanel glossary={glossary} isLoading={isLoadingNlp} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTranslationModal;