import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce"; // Import our new hook
import SuggestionPanel from "./home/SuggestionPanel"; // Import suggestion panel
import GlossaryPanel from "./home/GlossaryPanel"; // Import glossary panel
import nlpService from "../services/nlpService";
import translationService from "../services/translationService";
import projectService from "../services/projectService"; // Import project service
import { useAuthContext } from "../hooks/useAuthContext";
import { Select } from "./reusableComponents/Select"; // Import Select component
import "../styles/modal.css";

const AddTranslationModal = ({ isOpen, onClose, onSave, projectId, selectedProject }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    translationKey: "",
    language: "",
    translatedText: "",
    product: "General", // Default product value since we organize by projects now
  });

  // State for the Translation Helper
  const [suggestions, setSuggestions] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [isLoadingNlp, setIsLoadingNlp] = useState(false);
  const debouncedKey = useDebounce(formData.translationKey, 800); // Increased debounce delay for better performance

  // State for project languages
  const [projectLanguages, setProjectLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Effect to clear form when modal is opened/closed and fetch project languages
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
      
      // Fetch project languages when modal opens
      if (projectId) {
        fetchProjectLanguages();
      }
    }
  }, [isOpen, projectId]);

  // Function to fetch languages assigned to the selected project
  const fetchProjectLanguages = async () => {
    if (!projectId) {
      setProjectLanguages([]);
      return;
    }

    setIsLoadingLanguages(true);
    try {
      const response = await projectService.getProjectLanguages(projectId);
      const languages = response.data.languages || [];
      
      // Format for Select component - add empty option first for bulk creation
      const languageOptions = [
        { value: '', label: 'All Languages' }
      ];
      
      // Add individual language options
      languages.forEach(lang => {
        languageOptions.push({ 
          value: lang.code, 
          label: `${lang.name} (${lang.code.toUpperCase()})` 
        });
      });
      
      setProjectLanguages(languageOptions);
    } catch (err) {
      console.error('Error fetching project languages:', err);
      setError('Failed to load project languages');
      setProjectLanguages([]);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  useEffect(() => {
    // This effect runs when the debounced value of `translationKey` changes
    // Only fetch NLP data if the key is meaningful (at least 3 characters)
    if (debouncedKey && debouncedKey.length >= 3) {
      const fetchNlpData = async () => {
        setIsLoadingNlp(true);
        try {
          // Fire both API calls in parallel with shorter timeout
          const [suggestRes, glossaryRes] = await Promise.allSettled([
            Promise.race([
              nlpService.getSuggestions(debouncedKey, formData.product),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]),
            Promise.race([
              nlpService.getGlossary(debouncedKey),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ])
          ]);
          
          setSuggestions(suggestRes.status === 'fulfilled' ? suggestRes.value.data.suggestions || [] : []);
          setGlossary(glossaryRes.status === 'fulfilled' ? glossaryRes.value.data.glossary || [] : []);
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
      // Clear results if the input is empty or too short
      setSuggestions([]);
      setGlossary([]);
      setIsLoadingNlp(false);
    }
  }, [debouncedKey, formData.product]); // Re-run if the key or product changes

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for language field - convert to uppercase
    if (name === "language") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // When a user clicks a suggestion, update the `translatedText` field
  const handleSuggestionClick = (text) => {
    setFormData({ ...formData, translatedText: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    
    // FIXED: Include projectId in the submission data
    if (!projectId) {
      setError("Cannot save translation without a project ID.");
      setIsSaving(false);
      return;
    }

    // Validate translation key (mandatory)
    if (!formData.translationKey.trim()) {
      setError("Translation Key is required.");
      setIsSaving(false);
      return;
    }

    // Check if project has languages assigned
    if (projectLanguages.length === 0) {
      setError("This project has no languages assigned. Please assign languages to the project first.");
      setIsSaving(false);
      return;
    }

    // If no language is selected, create translations for ALL project languages
    if (!formData.language) {
      try {
        // Filter out the empty "Create for All" option and prepare translations array for bulk creation
        const actualLanguages = projectLanguages.filter(lang => lang.value !== '');
        
        if (actualLanguages.length === 0) {
          setError("No languages available for bulk creation.");
          setIsSaving(false);
          return;
        }

        const translationsToCreate = actualLanguages.map(langOption => ({
          translationKey: formData.translationKey,
          language: langOption.value,
          translatedText: formData.translatedText || "", // Use provided text or empty string
          product: formData.product,
          createdBy: user?.userName || "System",
          projectId,
        }));

        console.log('Creating bulk translations:', translationsToCreate);
        await translationService.addBulkTranslations(translationsToCreate);
        onSave();
        onClose();
      } catch (err) {
        console.error('Bulk translation error:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to add translations for all languages.";
        setError(`Error: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // If language is selected, create single translation
    const submissionData = {
      ...formData,
      createdBy: user?.userName || "System",
      projectId,
    };

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

  // We need to widen the modal to accommodate the two columns
  const modalStyle = {
    width: "800px",
    maxWidth: "90vw",
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
            <h2>Add New Translation</h2>
            <div className="subtitle">
              {selectedProject ? selectedProject.name : 'No Project Selected'}
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">
            ×
          </button>
        </div>
        {/* Use a grid layout for the form and the helper */}
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Column 1: The Form */}
          <div className="modal-body !p-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="space-y-5">
                <input
                  name="translationKey"
                  placeholder="Translation Key (Source Text)"
                  value={formData.translationKey}
                  onChange={handleChange}
                  className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base"
                  required
                />
                <div className="w-full">
                  <Select
                    options={projectLanguages}
                    selected={formData.language}
                    onSelect={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    disabled={isLoadingLanguages || projectLanguages.length === 0}
                  />
                  {projectLanguages.length === 0 && !isLoadingLanguages && (
                    <p className="text-sm text-gray-500 mt-1">
                      No languages assigned to this project. Please assign languages to the project first.
                    </p>
                  )}
                  {!formData.language && projectLanguages.length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      Will create translation placeholders for all {projectLanguages.length - 1} languages
                    </p>
                  )}
                </div>
                <textarea
                  name="translatedText"
                  placeholder="Translated Text (Optional - leave empty for placeholders)"
                  rows="4"
                  value={formData.translatedText}
                  onChange={handleChange}
                  className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base"
                />
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
                  {isSaving ? "Saving..." : 
                    !formData.language && projectLanguages.length > 1 
                      ? `Create for ${projectLanguages.length - 1} Languages` 
                      : "Save Translation"
                  }
                </button>
              </div>
            </form>
          </div>
          {/* Column 2: The Helper Components */}
          <div className="space-y-4">
            <SuggestionPanel
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              isLoading={isLoadingNlp}
            />
            <GlossaryPanel
              glossary={glossary}
              isLoading={isLoadingNlp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTranslationModal;
