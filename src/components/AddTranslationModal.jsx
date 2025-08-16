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

    // State for tab navigation
    const [activeTab, setActiveTab] = useState("translation");

    // State for the Translation Helper
    const [suggestions, setSuggestions] = useState([]);
    const [glossary, setGlossary] = useState([]);
    const [isLoadingNlp, setIsLoadingNlp] = useState(false);
    const debouncedKey = useDebounce(formData.translationKey, 800); // Increased debounce delay for better performance

    // State for glossary extraction
    const [glossaryInput, setGlossaryInput] = useState("");
    const [extractedGlossary, setExtractedGlossary] = useState([]);
    const [isLoadingGlossaryExtraction, setIsLoadingGlossaryExtraction] = useState(false);
    const debouncedGlossaryInput = useDebounce(glossaryInput, 800);

    // State for glossary terms with translations (for editing and saving)
    const [editableGlossaryTerms, setEditableGlossaryTerms] = useState([]);
    const [selectedGlossaryLanguage, setSelectedGlossaryLanguage] = useState("");
    const [isSavingGlossary, setIsSavingGlossary] = useState(false);

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
            setActiveTab("translation"); // Reset to translation tab
            setGlossaryInput(""); // Clear glossary input
            setExtractedGlossary([]); // Clear extracted glossary
            setEditableGlossaryTerms([]); // Clear editable glossary terms
            setSelectedGlossaryLanguage(""); // Clear selected language for glossary
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

    // Get languages for glossary dropdown (without "All Languages" option)
    const getGlossaryLanguageOptions = () => {
        return projectLanguages.filter(lang => lang.value !== '');
    };

    useEffect(() => {
        // This effect runs when the debounced value of `translationKey` changes
        // Only fetch NLP data if the key is meaningful (at least 3 characters) and we're on the translation tab
        if (debouncedKey && debouncedKey.length >= 3 && activeTab === "translation") {
            const fetchNlpData = async () => {
                setIsLoadingNlp(true);
                try {
                    // Only fetch suggestions for the translation tab, not glossary
                    const suggestRes = await Promise.race([
                        nlpService.getSuggestions(debouncedKey, formData.product),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                    ]);

                    setSuggestions(suggestRes.data.suggestions || []);
                } catch (nlpError) {
                    console.error("Failed to fetch suggestions:", nlpError);
                    setSuggestions([]); // Clear previous results on error
                } finally {
                    setIsLoadingNlp(false);
                }
            };
            fetchNlpData();
        } else {
            // Clear results if the input is empty, too short, or not on translation tab
            setSuggestions([]);
            setIsLoadingNlp(false);
        }
    }, [debouncedKey, formData.product, activeTab]); // Re-run if the key, product, or active tab changes

    // Effect for glossary extraction on the glossary tab
    useEffect(() => {
        if (debouncedGlossaryInput && debouncedGlossaryInput.length >= 10 && activeTab === "glossary") {
            const fetchGlossaryExtraction = async () => {
                setIsLoadingGlossaryExtraction(true);
                try {
                    const glossaryRes = await Promise.race([
                        nlpService.getGlossary(debouncedGlossaryInput),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                    ]);

                    const glossaryData = glossaryRes.data.glossary || [];
                    setExtractedGlossary(glossaryData);

                    // Convert extracted glossary to editable format
                    const editableTerms = glossaryData.map((item, index) => ({
                        id: index,
                        term: item.term || item,
                        translation: "",
                        originalItem: item
                    }));
                    setEditableGlossaryTerms(editableTerms);

                } catch (nlpError) {
                    console.error("Failed to extract glossary:", nlpError);
                    setExtractedGlossary([]);
                    setEditableGlossaryTerms([]);
                } finally {
                    setIsLoadingGlossaryExtraction(false);
                }
            };
            fetchGlossaryExtraction();
        } else {
            // Clear results if input is empty, too short, or not on glossary tab
            setExtractedGlossary([]);
            setEditableGlossaryTerms([]);
            setIsLoadingGlossaryExtraction(false);
        }
    }, [debouncedGlossaryInput, activeTab]);

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

    // Handle translation input change for glossary terms
    const handleGlossaryTranslationChange = (termId, translation) => {
        setEditableGlossaryTerms(prev =>
            prev.map(term =>
                term.id === termId ? { ...term, translation } : term
            )
        );
    };

    // Remove a glossary term from the list
    const removeGlossaryTerm = (termId) => {
        setEditableGlossaryTerms(prev => prev.filter(term => term.id !== termId));
    };

    // Save glossary terms as translations
    const handleSaveGlossary = async () => {
        setError("");
        setIsSavingGlossary(true);

        // Validation
        if (!selectedGlossaryLanguage) {
            setError("Please select a language for the glossary terms.");
            setIsSavingGlossary(false);
            return;
        }

        if (editableGlossaryTerms.length === 0) {
            setError("No glossary terms to save.");
            setIsSavingGlossary(false);
            return;
        }

        try {
            // Prepare translations array for bulk creation
            const translationsToCreate = editableGlossaryTerms.map(term => ({
                translationKey: term.term,
                language: selectedGlossaryLanguage,
                translatedText: term.translation || "", // Use provided translation or empty string
                product: formData.product,
                createdBy: user?.userName || "System",
                projectId,
            }));

            console.log('Creating glossary translations:', translationsToCreate);
            await translationService.addBulkTranslations(translationsToCreate);

            // Reset glossary tab UI
            setGlossaryInput("");
            setExtractedGlossary([]);
            setEditableGlossaryTerms([]);
            setSelectedGlossaryLanguage("");

            // Call onSave callback and optionally switch back to translation tab
            onSave();
            setActiveTab("translation");

        } catch (err) {
            console.error('Glossary save error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save glossary terms.";
            setError(`Error: ${errorMessage}`);
        } finally {
            setIsSavingGlossary(false);
        }
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

    // We need to widen the modal to accommodate the content based on active tab
    const modalStyle = {
        width: activeTab === "translation" ? "800px" : "800px",
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

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab("translation")}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "translation"
                                ? "border-brand-purple-base text-brand-purple-base"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Translation
                    </button>
                    <button
                        onClick={() => setActiveTab("glossary")}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "glossary"
                                ? "border-brand-purple-base text-brand-purple-base"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Glossary Extraction
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "translation" ? (
                    // Translation Tab Content
                    <div className="grid grid-cols-2 gap-6 p-6">
                        {/* Column 1: The Form */}
                        <div className="modal-body !p-0">
                            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                                <div className="space-y-3">
                                    <input
                                        name="translationKey"
                                        placeholder="Translation Key (Source Text)"
                                        value={formData.translationKey}
                                        onChange={handleChange}
                                        className="w-full p-1 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base"
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
                                        className="py-1 px-4 rounded-md border text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="py-1 px-4 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50"
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
                        {/* Column 2: The Suggestions Helper */}
                        <div className="space-y-4">
                            <SuggestionPanel
                                suggestions={suggestions}
                                onSuggestionClick={handleSuggestionClick}
                                isLoading={isLoadingNlp}
                            />
                        </div>
                    </div>
                ) : (
                    // Glossary Extraction Tab Content
                    <div className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter text for glossary extraction:
                                </label>
                                <textarea
                                    value={glossaryInput}
                                    onChange={(e) => setGlossaryInput(e.target.value)}
                                    placeholder="Enter any sentence or paragraph to extract technical terms and keywords..."
                                    rows="2"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple-base focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum 10 characters required for extraction
                                </p>
                            </div>

                            {/* Extracted Glossary Terms with Translation Inputs */}
                            {isLoadingGlossaryExtraction && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">Extracting terms...</p>
                                </div>
                            )}

                            {!isLoadingGlossaryExtraction && editableGlossaryTerms.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                        Extracted Glossary Terms ({editableGlossaryTerms.length})
                                    </h3>

                                    {/* Compact inline layout with max height and scroll */}
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                                        <div className="space-y-1">
                                            {editableGlossaryTerms.map((term) => (
                                                <div key={term.id} className="flex items-center gap-2 py-1 px-2 bg-white rounded hover:bg-gray-50 transition-colors">
                                                    {/* Glossary term on the left */}
                                                    <div className="flex-shrink-0 text-sm font-medium text-gray-700 min-w-0">
                                                        <span className="truncate block max-w-32" title={term.term}>
                                                            {term.term}
                                                        </span>
                                                    </div>

                                                    {/* Separator */}
                                                    <span className="text-gray-400 text-sm">:</span>

                                                    {/* Translation input - flexible width */}
                                                    <input
                                                        type="text"
                                                        placeholder="Enter translation"
                                                        value={term.translation}
                                                        onChange={(e) => handleGlossaryTranslationChange(term.id, e.target.value)}
                                                        className="flex-1 px-2 py-1 text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-brand-purple-base rounded transition-all"
                                                    />

                                                    {/* Remove button on the right */}
                                                    <button
                                                        onClick={() => removeGlossaryTerm(term.id)}
                                                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-xs transition-colors"
                                                        title="Remove term"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language Selection for Glossary */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select language for these glossary terms:
                                        </label>
                                        <Select
                                            options={getGlossaryLanguageOptions()}
                                            selected={selectedGlossaryLanguage}
                                            onSelect={setSelectedGlossaryLanguage}
                                            disabled={isLoadingLanguages || getGlossaryLanguageOptions().length === 0}
                                        />
                                        {getGlossaryLanguageOptions().length === 0 && !isLoadingLanguages && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                No languages assigned to this project. Please assign languages to the project first.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isLoadingGlossaryExtraction && editableGlossaryTerms.length === 0 && extractedGlossary.length === 0 && glossaryInput.length >= 10 && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-400">No terms extracted from the provided text.</p>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        </div>

                        {/* Action buttons for glossary tab */}
                        <div className="flex justify-between gap-4 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-1 px-4 rounded-md border text-gray-700 hover:bg-gray-100"
                            >
                                Close
                            </button>

                            {editableGlossaryTerms.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSaveGlossary}
                                    disabled={isSavingGlossary || !selectedGlossaryLanguage}
                                    className="py-1 px-4 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50"
                                >
                                    {isSavingGlossary ? "Saving..." : `Save ${editableGlossaryTerms.length} Terms`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddTranslationModal;
