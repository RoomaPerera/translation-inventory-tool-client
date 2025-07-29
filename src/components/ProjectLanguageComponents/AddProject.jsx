// AddProject.jsx - Updated to use the new CSV import methods

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
// Enhanced CSV handling for both inline and column formats
const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) {
    setFormData(prev => ({
      ...prev,
      csvFile: null,
      csvKeys: []
    }));
    return;
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    setError('Please select a valid CSV file.');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setError('CSV file is too large. Please select a file smaller than 5MB.');
    return;
  }

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
    complete: (results) => {
      try {
        console.log('Raw CSV data:', results.data);
        
        let keys = [];
        let detectedFormat = '';
        
        // Smart detection and handling of different CSV formats
        results.data.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell && typeof cell === 'string') {
              const trimmedCell = cell.trim();
              
              // Check if cell contains multiple comma-separated keys (inline format)
              if (trimmedCell.includes(',') && trimmedCell.split(',').length > 2) {
                // Likely inline format: "key1,key2,key3,..."
                const splitKeys = trimmedCell.split(',').map(key => key.trim());
                keys.push(...splitKeys);
                
                if (!detectedFormat) {
                  detectedFormat = `inline (${splitKeys.length} keys in cell [${rowIndex + 1},${cellIndex + 1}])`;
                }
              } else {
                // Single key (column/row format)
                keys.push(trimmedCell);
                
                if (!detectedFormat && keys.length === 1) {
                  detectedFormat = 'column/row format';
                }
              }
            }
          });
        });
        
        console.log(`Detected CSV format: ${detectedFormat}`);
        console.log('Extracted keys before validation:', keys);
        
        // Remove duplicates and empty values
        keys = [...new Set(keys.filter(key => key && key.trim() !== ''))];
        
        console.log(`Unique keys (${keys.length} total):`, keys);
        
        // Enhanced validation - optimized for translation keys
        const validKeys = [];
        const invalidKeys = [];
        
        keys.forEach(key => {
          const trimmedKey = key.trim();
          
          // Translation key validation rules:
          // - Not empty after trimming
          // - Between 1-200 characters  
          // - No HTML-like characters (<>)
          // - Allow common translation key characters: letters, numbers, dots, underscores, hyphens
          // - Block obviously invalid values
          const isValid = 
            trimmedKey.length > 0 && 
            trimmedKey.length <= 200 && 
            !/[<>]/.test(trimmedKey) && 
            trimmedKey !== 'undefined' && 
            trimmedKey !== 'null' &&
            trimmedKey !== 'NULL' &&
            !/^[\s\t\r\n]*$/.test(trimmedKey); // Not just whitespace
            
          if (isValid) {
            validKeys.push(trimmedKey);
          } else {
            let reason = 'Unknown issue';
            if (trimmedKey.length === 0) reason = 'Empty after trimming';
            else if (trimmedKey.length > 200) reason = 'Too long (>200 chars)';
            else if (/[<>]/.test(trimmedKey)) reason = 'Contains HTML characters (<>)';
            else if (['undefined', 'null', 'NULL'].includes(trimmedKey)) reason = 'Invalid literal value';
            else if (/^[\s\t\r\n]*$/.test(trimmedKey)) reason = 'Only whitespace';
            
            invalidKeys.push({ key: trimmedKey, reason });
          }
        });

        console.log(`Valid keys (${validKeys.length}):`, validKeys);
        if (invalidKeys.length > 0) {
          console.log(`Invalid keys (${invalidKeys.length}):`, invalidKeys);
        }

        // Enhanced error handling with format-specific guidance
        if (validKeys.length === 0) {
          let errorMsg = 'No valid translation keys found in the CSV file.';
          
          if (keys.length === 0) {
            errorMsg += ' The CSV appears to be empty or contains no readable content.';
          } else if (invalidKeys.length > 0) {
            const reasons = [...new Set(invalidKeys.map(item => item.reason))];
            errorMsg += ` Found ${keys.length} items but none passed validation. Issues: ${reasons.join(', ')}.`;
          }
          
          // Add format-specific guidance
          errorMsg += '\n\nSupported formats:\n';
          errorMsg += '• Inline: "key1,key2,key3" (comma-separated in one cell)\n';
          errorMsg += '• Column: One key per cell/row\n';
          errorMsg += '• Mixed: Combination of both formats';
          
          console.error('CSV validation failed:', { 
            detectedFormat,
            rawData: results.data, 
            extractedKeys: keys, 
            validKeys, 
            invalidKeys 
          });
          setError(errorMsg);
          return;
        }

        // Success message with format detection info
        let successInfo = `Successfully loaded ${validKeys.length} translation keys`;
        if (detectedFormat) {
          successInfo += ` (detected format: ${detectedFormat})`;
        }
        
        if (invalidKeys.length > 0) {
          console.warn(`${successInfo}, skipped ${invalidKeys.length} invalid keys:`, invalidKeys);
        } else {
          console.log(successInfo);
        }

        setFormData(prev => ({
          ...prev,
          csvFile: file,
          csvKeys: validKeys
        }));

        // Clear any previous errors
        if (error && error.includes('CSV')) {
          setError(null);
        }

      } catch (parseError) {
        console.error('Error processing CSV data:', parseError);
        setError('Failed to process CSV file. Please check the file format and try again.');
      }
    },
    error: (parseError) => {
      console.error('CSV parsing error:', parseError);
      setError('Failed to parse CSV file. Please ensure it\'s a valid CSV format and try again.');
    }
  });
};

  // UPDATED: Enhanced CSV import function with better error handling
  const importTranslationsFromCSV = async (projectId) => {
    if (!formData.csvKeys || formData.csvKeys.length === 0 || !formData.languages || formData.languages.length === 0) {
      return { created: 0, skipped: 0 };
    }

    try {
      console.log(`Importing ${formData.csvKeys.length} keys for ${formData.languages.length} languages...`);
      
      // Use the primary CSV import method
      const result = await translationService.importTranslationsFromCSV(
        formData.csvKeys,
        projectId,
        formData.languages
      );
      
      console.log('CSV Import Result:', result);
      return result.data || result;
    } catch (error) {
      console.error('Primary CSV import failed, trying alternative method:', error);
      
      // Fallback to alternative method if primary fails
      try {
        const fallbackResult = await translationService.createTranslationsFromCSVKeys(
          formData.csvKeys,
          projectId,
          formData.languages
        );
        
        console.log('Fallback CSV Import Result:', fallbackResult);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback CSV import also failed:', fallbackError);
        return { 
          created: 0, 
          skipped: 0, 
          error: `CSV import failed: ${fallbackError.message || 'Unknown error'}` 
        };
      }
    }
  };

  // Validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Project name must be at least 2 characters long');
      return false;
    }

    if (formData.name.trim().length > 100) {
      setError('Project name must not exceed 100 characters');
      return false;
    }

    if (formData.defaultLanguage && !formData.languages.includes(formData.defaultLanguage)) {
      setError('Default language must be one of the assigned languages');
      return false;
    }

    // Validate CSV keys if provided
    if (formData.csvKeys.length > 0 && formData.languages.length === 0) {
      setError('Please assign at least one language before importing CSV keys');
      return false;
    }

    const userId = getUserId();
    if (!userId) {
      setError('You must be logged in to create a project. Please refresh the page and try again.');
      return false;
    }

    return true;
  };

  // UPDATED: Enhanced form submission with better error handling and progress tracking
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
        ...(formData.defaultLanguage && { defaultLanguage: formData.defaultLanguage })
      };
      
      console.log('Creating project with data:', projectData);
      const result = await projectService.addProject(projectData);
      console.log('Project created successfully:', result);
      
      // UPDATED: Enhanced CSV import with better status reporting
      let csvImportResult = null;
      if (result && result._id && formData.csvKeys.length > 0) {
        console.log('Starting CSV import...');
        csvImportResult = await importTranslationsFromCSV(result._id);
        console.log('CSV import completed:', csvImportResult);
      }
      
      // Build success message
      let successMessage = 'Project created successfully!';
      
      // Handle email notification status
      if (result.notificationStatus === 'email_failed') {
        successMessage = 'Project created successfully! (Note: Email notifications could not be sent)';
      }
      
      // Add default language info
      if (formData.defaultLanguage) {
        const defaultLangName = availableLanguages.find(lang => lang.code === formData.defaultLanguage)?.name;
        successMessage += ` Default language set to ${defaultLangName || formData.defaultLanguage}.`;
      }
      
      // UPDATED: Enhanced CSV import success message with detailed stats
      if (csvImportResult && formData.csvKeys.length > 0) {
        const expectedTotal = formData.csvKeys.length * formData.languages.length;
        
        if (csvImportResult.error) {
          successMessage += ` Warning: CSV import encountered an error - ${csvImportResult.error}`;
        } else if (csvImportResult.created > 0) {
          successMessage += ` Successfully imported ${csvImportResult.created} translation entries from CSV`;
          
          if (csvImportResult.created === expectedTotal) {
            successMessage += ` (${formData.csvKeys.length} keys × ${formData.languages.length} languages).`;
          } else {
            successMessage += ` out of ${expectedTotal} expected entries.`;
          }
          
          if (csvImportResult.skipped > 0) {
            successMessage += ` ${csvImportResult.skipped} entries were skipped as duplicates.`;
          }
        } else if (csvImportResult.skipped > 0) {
          successMessage += ` All ${csvImportResult.skipped} translation entries from CSV already existed.`;
        } else {
          successMessage += ` Note: No translation entries were created from the CSV file.`;
        }
      }
      
      setSuccess(successMessage);
      resetForm();
      
      // Navigate or trigger success callback after delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result); // Pass the created project data
        }
      }, 2000);
      
      // Clear success message after longer delay
      setTimeout(() => {
        setSuccess(null);
      }, 8000); // Increased timeout for longer messages
      
    } catch (err) {
      console.error('Error creating project:', err);
      handleSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced error handling
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
    
    // Enhanced error messages with actionable advice
    if (errorMessage.includes('fetch') || errorMessage.includes('Network')) {
      errorMessage += '. Please check your internet connection and try again.';
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorMessage = 'You are not authorized to create projects. Please log in again.';
    } else if (errorMessage.includes('400')) {
      errorMessage = 'Invalid project data. Please check all required fields and try again.';
    } else if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
      errorMessage = 'A project with this name already exists. Please choose a different name.';
    } else if (errorMessage.includes('413')) {
      errorMessage = 'The project data is too large. Please reduce the CSV file size or number of languages.';
    } else if (errorMessage.includes('500')) {
      errorMessage = 'Server error occurred. Please try again in a few moments.';
    }
    
    setError(errorMessage);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Status Messages - Enhanced with better styling */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-md text-sm border-l-4 border-red-400">
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-3 p-3 bg-green-50 text-green-700 rounded-md text-sm border-l-4 border-green-400">
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>{success}</div>
          </div>
        </div>
      )}
      
      {languageSuccess && (
        <div className="mb-3 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border-l-4 border-blue-400">
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>{languageSuccess}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name - Enhanced */}
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
            maxLength={100}
            placeholder="Enter project name (2-100 characters)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.name.length}/100 characters
          </div>
        </div>
        
        {/* Description - Enhanced */}
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
            maxLength={500}
            placeholder="Enter project description (optional, max 500 characters)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </div>
        </div>
        
        {/* Language Assignment - Same as before */}
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
          
          {/* Selected Languages Display */}
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

        {/* Default Language Selection */}
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
        
        {/* ENHANCED: CSV File Upload with better validation and preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="csvFile">
            Import CSV Keys (Optional)
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="text-xs text-gray-500 mt-1">
            Upload a CSV file containing translation keys. Max file size: 5MB
          </div>
          
          {/* Enhanced CSV Preview with detailed information */}
          {formData.csvKeys.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs border">
              <div className="flex items-center text-green-600 mb-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <strong>{formData.csvKeys.length} keys loaded from CSV</strong>
              </div>
              
              <div className="text-gray-600 mb-2">
                <strong>File:</strong> {formData.csvFile?.name}
              </div>
              
              <div className="text-gray-600 mb-2">
                <strong>Preview:</strong> {formData.csvKeys.slice(0, 5).join(', ')}
                {formData.csvKeys.length > 5 && ` ... +${formData.csvKeys.length - 5} more`}
              </div>
              
              {formData.languages.length > 0 ? (
                <div className="p-2 bg-blue-50 rounded text-blue-700 border border-blue-200">
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong>Ready to import!</strong>
                  </div>
                  <div>
                    Will create <strong>{formData.csvKeys.length * formData.languages.length}</strong> translation entries
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ({formData.csvKeys.length} keys × {formData.languages.length} languages)
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-orange-50 rounded text-orange-700 border border-orange-200">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong>Assign languages first to create translation entries</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Buttons - Enhanced */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => onSuccess && onSuccess()}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Project
              </>
            )}
          </button>
        </div>
      </form>

      {/* Language Assignment Modal - Same as before */}
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