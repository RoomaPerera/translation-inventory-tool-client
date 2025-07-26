import { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import projectService from '../../services/projectService';

const EditProjectForm = ({ project = {}, onSuccess, availableLanguages = [] }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    languages: project?.languages || [],
    defaultLanguage: project?.defaultLanguage || '', // Add default language to form state
  });

  const [showLanguageSection, setShowLanguageSection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [languageMessage, setLanguageMessage] = useState('');
  const [recentlyAdded, setRecentlyAdded] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle default language selection
  const handleDefaultLanguageChange = (e) => {
    const selectedCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      defaultLanguage: selectedCode
    }));
  };

  // Get available languages for default language dropdown (only assigned languages)
  const getAssignedLanguageObjects = () => {
    return availableLanguages.filter(lang => formData.languages.includes(lang.code));
  };

  // Get language name by code
  const getLanguageName = (code) => {
    const lang = availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  const showTemporaryMessage = (message, type = 'success') => {
    setLanguageMessage({ text: message, type });
    setTimeout(() => {
      setLanguageMessage('');
    }, 3000);
  };

  const removeLanguage = (index) => {
    const removedLang = formData.languages[index];
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
      // Clear default language if the removed language was the default
      defaultLanguage: prev.defaultLanguage === removedLang ? '' : prev.defaultLanguage
    }));
    showTemporaryMessage(`Language "${removedLang}" removed`, 'info');
  };

  const toggleLanguage = (langCode) => {
    const isAdding = !formData.languages.includes(langCode);
    
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter((c) => c !== langCode)
        : [...prev.languages, langCode],
      // Clear default language if we're removing it
      defaultLanguage: !isAdding && prev.defaultLanguage === langCode ? '' : prev.defaultLanguage
    }));

    // Show feedback for toggle action
    const langName = availableLanguages.find(lang => lang.code === langCode)?.name || langCode;
    const message = isAdding 
      ? `${langName} (${langCode}) added` 
      : `${langName} (${langCode}) removed`;
    showTemporaryMessage(message, isAdding ? 'success' : 'info');

    // Highlight recently toggled language
    if (isAdding) {
      setRecentlyAdded([langCode]);
      setTimeout(() => {
        setRecentlyAdded([]);
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate default language if provided
    if (formData.defaultLanguage && !formData.languages.includes(formData.defaultLanguage)) {
      setError('Default language must be one of the assigned languages');
      setIsSubmitting(false);
      return;
    }

    try {
      const projectData = { 
        ...formData,
        // Include default language only if one is selected
        ...(formData.defaultLanguage && { defaultLanguage: formData.defaultLanguage })
      };
      
      if (project?._id) {
        await projectService.updateProject(project._id, projectData);
        let successMessage = 'Project updated successfully!';
        
        // Add default language info to success message if set
        if (formData.defaultLanguage) {
          const defaultLangName = availableLanguages.find(lang => lang.code === formData.defaultLanguage)?.name;
          successMessage += ` Default language set to ${defaultLangName || formData.defaultLanguage}.`;
        }
        
        setSuccess(successMessage);
      } else {
        if (user?._id) projectData.createdBy = user._id;
        await projectService.addProject(projectData);
        setSuccess('Project created successfully!');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded">{success}</div>}

      <div>
        <label className="block mb-1 font-medium">
          Project Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Toggle Button - Left aligned */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Languages {formData.languages.length > 0 && (
            <span className="text-indigo-600 text-xs">
              ({formData.languages.length} selected
              {formData.defaultLanguage && (
                <span className="text-green-600"> • Default: {formData.defaultLanguage}</span>
              )})
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setShowLanguageSection(!showLanguageSection)}
          className="text-indigo-600 hover:underline text-sm mb-2 flex items-center space-x-1"
        >
          <span>{showLanguageSection ? 'Hide Languages' : 'Edit Languages'}</span>
          <span className="text-xs">{showLanguageSection ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Conditionally Show Language Section */}
      {showLanguageSection && (
        <div className="space-y-3">
          {/* Language feedback message */}
          {languageMessage && (
            <div className={`p-2 rounded text-sm transition-all duration-300 ${
              languageMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
              languageMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
              languageMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-xs">
                  {languageMessage.type === 'success' ? '✅' : 
                   languageMessage.type === 'error' ? '❌' : 
                   languageMessage.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span>{languageMessage.text}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium text-sm">Available Languages</label>
            <div className="flex flex-wrap gap-1 mb-3">
              {availableLanguages.map((lang) => {
                const isSelected = formData.languages.includes(lang.code);
                const isDefault = formData.defaultLanguage === lang.code;
                
                return (
                  <button
                    type="button"
                    key={lang._id}
                    onClick={() => toggleLanguage(lang.code)}
                    title={`${lang.name} (${lang.code})${isDefault ? ' - Default Language' : ''}`}
                    className={`px-2 py-1 rounded text-xs border transition-all duration-200 relative ${
                      isSelected
                        ? isDefault
                          ? 'bg-green-200 border-green-400 text-green-800 shadow-sm ring-2 ring-green-300'
                          : 'bg-indigo-200 border-indigo-400 text-indigo-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    } ${
                      recentlyAdded.includes(lang.code) ? 'ring-2 ring-green-300 ring-opacity-50' : ''
                    }`}
                  >
                    {lang.code}
                    {isSelected && (
                      <span className={`ml-1 ${isDefault ? 'text-green-600' : 'text-indigo-600'}`}>
                        {isDefault ? '★' : '✓'}
                      </span>
                    )}
                    {isDefault && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
            {formData.defaultLanguage && (
              <p className="text-xs text-green-600 mt-1">
                ★ {availableLanguages.find(lang => lang.code === formData.defaultLanguage)?.name || formData.defaultLanguage} ({formData.defaultLanguage}) is set as default
              </p>
            )}
          </div>

          {/* Selected Language Tags */}
          {formData.languages.length > 0 && (
            <div>
              <label className="block mb-2 font-medium text-sm">Selected Languages</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.languages.map((lang, idx) => {
                  const isDefault = formData.defaultLanguage === lang;
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full flex items-center text-xs border transition-all duration-200 ${
                        isDefault
                          ? 'bg-green-100 text-green-800 border-green-300 ring-1 ring-green-300'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      } ${
                        recentlyAdded.includes(lang) ? 'ring-2 ring-green-300 ring-opacity-50' : ''
                      }`}
                    >
                      {isDefault && <span className="mr-1 text-green-600">★</span>}
                      {lang}
                      {isDefault && (
                        <span className="ml-1 text-xs font-medium">(Default)</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeLanguage(idx)}
                        className={`ml-1 hover:opacity-70 transition-colors ${
                          isDefault ? 'text-green-600' : 'text-indigo-500'
                        }`}
                        title={`Remove ${lang}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Default Language Selection */}
          {formData.languages.length > 0 && (
            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="defaultLanguage">
                Default Language
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={handleDefaultLanguageChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select default language (optional)</option>
                {getAssignedLanguageObjects().map((lang) => (
                  <option key={lang._id} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The default language will be used as the primary language for this project.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4 gap-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="text-gray-700 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{isSubmitting ? 'Saving...' : project?._id ? 'Update' : 'Create'}</span>
        </button>
      </div>
    </form>
  );
};

export default EditProjectForm;