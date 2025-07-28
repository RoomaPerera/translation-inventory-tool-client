// AddProject.jsx - Updated to use the new bulk CSV import endpoint

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import projectService from '../../services/projectService';
import translationService from '../../services/translationService';
import Button from '../reusableComponents/Button';
import Modal from '../reusableComponents/Modal';
import Papa from 'papaparse';

const AddProject = ({ onSuccess, availableLanguages = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languages: [],
    defaultLanguage: '',
    csvFile: null, 
    csvKeys: []
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [languageSuccess, setLanguageSuccess] = useState(null);
  
  // Modal state
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Utility functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      languages: [],
      defaultLanguage: '',
      csvFile: null,
      csvKeys: []
    });
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setLanguageSuccess(null);
  };

  const getUserId = () => {
    let userId = user?._id || user?.id;
    
    if (!userId && user?.token) {
      try {
        const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
        userId = tokenPayload.id || tokenPayload._id || tokenPayload.userId;
      } catch (jwtError) {
        console.error('Failed to decode JWT token:', jwtError);
      }
    }
    
    return userId;
  };

  const getAssignedLanguageObjects = () => {
    return availableLanguages.filter(lang => formData.languages.includes(lang.code));
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDefaultLanguageChange = (e) => {
    const selectedCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      defaultLanguage: selectedCode
    }));
  };

  // Language management
  const removeLanguage = (index) => {
    const removedLanguage = formData.languages[index];
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      languages: newLanguages,
      defaultLanguage: prev.defaultLanguage === removedLanguage ? '' : prev.defaultLanguage
    }));
  };

  const handleAssignLanguagesClick = () => {
    setSelectedLanguageIds([]);
    setIsLanguageModalOpen(true);
  };

  const handleLanguageToggle = (languageId) => {
    setSelectedLanguageIds(prev => {
      if (prev.includes(languageId)) {
        return prev.filter(id => id !== languageId);
      } else {
        return [...prev, languageId];
      }
    });
  };

  const handleAssignSelectedLanguages = async () => {
    if (selectedLanguageIds.length === 0) return;
    
    setIsAssigning(true);
    try {
      const selectedLanguages = availableLanguages
        .filter(lang => selectedLanguageIds.includes(lang._id))
        .map(lang => lang.code);
      
      const newLanguages = selectedLanguages.filter(code => !formData.languages.includes(code));
      
      if (newLanguages.length > 0) {
        setFormData(prev => ({
          ...prev,
          languages: [...prev.languages, ...newLanguages]
        }));
        
        const message = newLanguages.length === 1 
          ? `Language "${newLanguages[0]}" assigned successfully!`
          : `${newLanguages.length} languages assigned successfully!`;
        
        setLanguageSuccess(message);
        setTimeout(() => setLanguageSuccess(null), 3000);
      }
      
      setSelectedLanguageIds([]);
      setIsLanguageModalOpen(false);
    } catch (error) {
      console.error('Error assigning languages:', error);
      setError('Failed to assign languages');
    } finally {
      setIsAssigning(false);
    }
  };

  // CSV handling
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({
        ...prev,
        csvFile: file,
        csvKeys: []
      }));
      return;
    }

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const keys = results.data.flat().filter(key => key && key.trim() !== '');
        setFormData(prev => ({
          ...prev,
          csvFile: file,
          csvKeys: keys
        }));
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file. Please check the file format.');
      }
    });
  };

  // NEW FUNCTION: Import translations from CSV using dedicated endpoint
  const importTranslationsFromCSV = async (projectId) => {
    if (formData.csvKeys.length === 0 || formData.languages.length === 0) {
      return { created: 0, skipped: 0 };
    }

    try {
      const result = await translationService.importTranslationsFromCSV(
        formData.csvKeys,
        projectId,
        formData.languages
      );
      
      console.log(`CSV Import Result:`, result);
      return result.data || result;
    } catch (error) {
      console.error('Error importing CSV translations:', error);
      // Don't throw here - we still want the project creation to be considered successful
      return { created: 0, skipped: 0, error: error.message };
    }
  };

  // Validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }

    if (formData.defaultLanguage && !formData.languages.includes(formData.defaultLanguage)) {
      setError('Default language must be one of the assigned languages');
      return false;
    }

    const userId = getUserId();
    if (!userId) {
      setError('You must be logged in to create a project. Please refresh the page and try again.');
      return false;
    }

    return true;
  };

  // Form submission - UPDATED to use new CSV import endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearMessages();
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      const userId = getUserId();
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        languages: formData.languages,
        createdBy: userId,
        csvKeys: formData.csvKeys,
        ...(formData.defaultLanguage && { defaultLanguage: formData.defaultLanguage })
      };
      
      const result = await projectService.addProject(projectData);
      
      // NEW: Import translations from CSV using dedicated endpoint
      let csvImportResult = null;
      if (result && result._id) {
        csvImportResult = await importTranslationsFromCSV(result._id);
      }
      
      let successMessage = 'Project created successfully!';
      if (result.notificationStatus === 'email_failed') {
        successMessage = 'Project created successfully! (Note: Email notifications could not be sent)';
      }
      
      if (formData.defaultLanguage) {
        const defaultLangName = availableLanguages.find(lang => lang.code === formData.defaultLanguage)?.name;
        successMessage += ` Default language set to ${defaultLangName || formData.defaultLanguage}.`;
      }
      
      // NEW: Enhanced CSV import success message
      if (csvImportResult && formData.csvKeys.length > 0) {
        if (csvImportResult.error) {
          successMessage += ` Warning: CSV import encountered an error - ${csvImportResult.error}`;
        } else if (csvImportResult.created > 0) {
          successMessage += ` Successfully imported ${csvImportResult.created} translation entries from CSV.`;
          if (csvImportResult.skipped > 0) {
            successMessage += ` (${csvImportResult.skipped} entries were skipped as duplicates)`;
          }
        } else if (csvImportResult.skipped > 0) {
          successMessage += ` All ${csvImportResult.skipped} translation entries from CSV already existed.`;
        }
      }
      
      setSuccess(successMessage);
      resetForm();
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error creating project:', err);
      handleSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitError = (err) => {
    let errorMessage = 'Failed to create project';
    
    if (err.response) {
      const responseData = err.response.data;
      
      // Handle email failure but project created successfully
      if (err.response.status === 500 && 
          responseData?.error === 'Email sending failed' && 
          responseData?.message === 'Error creating project') {
        setSuccess('Project created successfully! (Note: Email notifications could not be sent)');
        resetForm();
        
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
        
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
        return;
      }
      
      errorMessage = responseData?.message || responseData?.error || errorMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    // Enhanced error messages
    if (errorMessage.includes('fetch')) {
      errorMessage += '. Please check if the server is running.';
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorMessage = 'You are not authorized to create projects. Please log in again.';
    } else if (errorMessage.includes('400')) {
      errorMessage = 'Invalid project data. Please check all required fields.';
    } else if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
      errorMessage = 'A project with this name already exists. Please choose a different name.';
    }
    
    setError(errorMessage);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Status Messages - Compact */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm border-l-4 border-red-300">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-3 p-2 bg-green-50 text-green-700 rounded text-sm border-l-4 border-green-300">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}
      
      {languageSuccess && (
        <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded text-sm border-l-4 border-blue-300">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {languageSuccess}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            Project Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter project name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Description - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            placeholder="Enter project description (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Language Assignment - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Languages
          </label>
          
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              onClick={handleAssignLanguagesClick}
              className="bg-brand-purple-base hover:bg-purple-700 text-white !py-1.5 !px-3 !text-sm"
              disabled={availableLanguages.length === 0}
            >
              + Assign
            </Button>
            {availableLanguages.length === 0 && (
              <span className="text-xs text-gray-500">
                No languages available
              </span>
            )}
          </div>
          
          {/* Selected Languages Display - Compact */}
          {formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.languages.map((lang, index) => (
                <div 
                  key={index} 
                  className={`px-2 py-1 text-xs rounded flex items-center ${
                    formData.defaultLanguage === lang
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <span>
                    {lang}
                    {formData.defaultLanguage === lang && (
                      <span className="ml-1">(Default)</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className={`ml-1 hover:opacity-70 focus:outline-none ${
                      formData.defaultLanguage === lang ? 'text-green-500' : 'text-indigo-500'
                    }`}
                    title="Remove language"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Language Selection - Compact */}
        {formData.languages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="defaultLanguage">
              Default Language
            </label>
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              value={formData.defaultLanguage}
              onChange={handleDefaultLanguageChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select default language (optional)</option>
              {getAssignedLanguageObjects().map((lang) => (
                <option key={lang._id} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* CSV File Upload - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="csvFile">
            Import CSV Keys (Optional)
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          
          {/* Enhanced CSV Preview */}
          {formData.csvKeys.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs border">
              <div className="text-green-600 mb-1">
                ✓ {formData.csvKeys.length} keys loaded from CSV
              </div>
              <div className="text-gray-600 truncate mb-1">
                Preview: {formData.csvKeys.slice(0, 3).join(', ')}
                {formData.csvKeys.length > 3 && ` ... +${formData.csvKeys.length - 3} more`}
              </div>
              {formData.languages.length > 0 ? (
                <div className="text-blue-600">
                  📊 Will create {formData.csvKeys.length * formData.languages.length} translation entries 
                  <span className="text-gray-500">
                    ({formData.csvKeys.length} keys × {formData.languages.length} languages)
                  </span>
                </div>
              ) : (
                <div className="text-orange-600">
                  ⚠️ Assign languages first to create translation entries
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Buttons - Compact */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={() => onSuccess && onSuccess()}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1 inline-block"></div>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>

      {/* Language Assignment Modal */}
      <Modal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        title="Assign Languages to Project"
        subtitle={formData.name || 'New Project'}
      >
        {availableLanguages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">No languages available</p>
            <p className="text-sm text-gray-400">
              Please add languages in the Language Management section first.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Select languages to assign to this project:
            </p>
            
            <div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
              {availableLanguages
                .filter(lang => !formData.languages.includes(lang.code))
                .map((lang) => {
                  const isSelected = selectedLanguageIds.includes(lang._id);
                  
                  return (
                    <div
                      key={lang._id}
                      className="flex items-center py-2 px-2 rounded transition-colors hover:bg-gray-50 cursor-pointer"
                      onClick={() => !isAssigning && handleLanguageToggle(lang._id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAssigning}
                        onChange={() => handleLanguageToggle(lang._id)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="ml-2 flex-1">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{lang.code}</span>
                          <span className="ml-1">- {lang.name || 'No description'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Assignment Button */}
            {selectedLanguageIds.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedLanguageIds.length} selected
                </p>
                <Button
                  onClick={handleAssignSelectedLanguages}
                  disabled={isAssigning}
                  className="bg-purple-600 text-white hover:bg-purple-700 !py-1.5 !px-3 !text-sm"
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1 inline-block"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Languages'
                  )}
                </Button>
              </div>
            )}
            
            {availableLanguages.filter(lang => !formData.languages.includes(lang.code)).length === 0 && (
              <div className="text-center py-3">
                <p className="text-sm text-gray-500">All available languages have been assigned to this project.</p>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default AddProject;