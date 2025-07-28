import { useState, useEffect } from 'react';
import languageService from '../../services/languageService';

const EditLanguageForm = ({ language = {}, onSuccess, existingLanguages = [] }) => {
  const [formData, setFormData] = useState({
    code: language?.code || '',
    name: language?.name || '',
    description: language?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [languageMessage, setLanguageMessage] = useState('');

  // Initialize form data when language prop changes
  useEffect(() => {
    if (language) {
      setFormData({
        code: language.code || '',
        name: language.name || '',
        description: language.description || '',
      });
    }
  }, [language]);

  const showTemporaryMessage = (message, type = 'success') => {
    setLanguageMessage({ text: message, type });
    setTimeout(() => {
      setLanguageMessage('');
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));

    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }

    // Show feedback for code changes
    if (name === 'code' && value !== language?.code) {
      if (value.trim() === '') {
        showTemporaryMessage('Language code is required', 'error');
      } else if (value.length < 2) {
        showTemporaryMessage('Language code should be at least 2 characters', 'warning');
      } else if (value.length > 10) {
        showTemporaryMessage('Language code should be 10 characters or less', 'warning');
      } else {
        // Check if code already exists (excluding current language)
        const codeExists = existingLanguages.some(lang => 
          lang.code.toLowerCase() === value.toLowerCase() && lang._id !== language._id
        );
        if (codeExists) {
          showTemporaryMessage(`Language code "${value}" already exists`, 'error');
        } else {
          showTemporaryMessage(`Language code updated to "${value}"`, 'success');
        }
      }
    }
  };

  const validateForm = () => {
    const errors = [];

    // Validate code
    if (!formData.code.trim()) {
      errors.push('Language code is required');
    } else if (formData.code.length < 2) {
      errors.push('Language code must be at least 2 characters long');
    } else if (formData.code.length > 10) {
      errors.push('Language code must be 10 characters or less');
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.code)) {
      errors.push('Language code can only contain letters, numbers, hyphens, and underscores');
    }

    // Check for duplicate code (excluding current language)
    const codeExists = existingLanguages.some(lang => 
      lang.code.toLowerCase() === formData.code.toLowerCase() && lang._id !== language._id
    );
    if (codeExists) {
      errors.push(`Language code "${formData.code}" already exists`);
    }

    // Validate name
    if (!formData.name.trim()) {
      errors.push('Language name is required');
    } else if (formData.name.length > 100) {
      errors.push('Language name must be 100 characters or less');
    }

    // Check for duplicate name (excluding current language)
    const nameExists = existingLanguages.some(lang => 
      lang.name && lang.name.toLowerCase() === formData.name.toLowerCase() && lang._id !== language._id
    );
    if (nameExists) {
      errors.push(`Language name "${formData.name}" already exists`);
    }

    // Validate description (optional)
    if (formData.description && formData.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setIsSubmitting(false);
      return;
    }

    try {
      const languageData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };
      
      if (language?._id) {
        await languageService.updateLanguage(language._id, languageData);
        let successMessage = 'Language updated successfully!';
        
        // Add specific change info to success message
        if (formData.code !== language.code) {
          successMessage += ` Code changed from "${language.code}" to "${formData.code}".`;
        }
        if (formData.name !== language.name) {
          successMessage += ` Name updated to "${formData.name}".`;
        }
        
        setSuccess(successMessage);
      } else {
        // This shouldn't happen for edit form, but included for completeness
        await languageService.addLanguage(languageData);
        setSuccess('Language created successfully!');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error('Failed to update language:', err);
      let errorMessage = 'Failed to update language.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.code !== (language?.code || '') ||
      formData.name !== (language?.name || '') ||
      formData.description !== (language?.description || '')
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded">{success}</div>}

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
        <label className="block mb-1 font-medium">
          Language Code<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          placeholder="e.g., en, fr, es, zh-CN"
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use standard language codes (ISO 639-1). E.g., "en" for English, "fr" for French.
        </p>
      </div>

      <div>
        <label className="block mb-1 font-medium">
          Language Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., English, French, Spanish"
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Full name of the language as it should appear in the interface.
        </p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Optional description or notes about this language..."
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Optional: Add any notes or special information about this language.
        </p>
      </div>

      {/* Show current values for reference */}
      {language?._id && (
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Values:</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Code:</span> {language.code}
            </div>
            <div>
              <span className="font-medium">Name:</span> {language.name || 'Not set'}
            </div>
          </div>
          {language.description && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Description:</span> {language.description}
            </div>
          )}
        </div>
      )}

      {/* Show changes indicator */}
      {hasChanges() && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700 font-medium">You have unsaved changes</span>
          </div>
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
          disabled={isSubmitting || !hasChanges()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{isSubmitting ? 'Updating...' : 'Update Language'}</span>
        </button>
      </div>
    </form>
  );
};

export default EditLanguageForm;