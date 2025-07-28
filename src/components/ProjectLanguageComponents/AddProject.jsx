import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import projectService from '../../services/projectService';
import API from '../../services/axiosInstance';
import Button from '../reusableComponents/Button';
import Modal from '../reusableComponents/Modal';

const AddProject = ({ onSuccess, availableLanguages = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Get the current user
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languages: [],
    defaultLanguage: '' // New field for default language
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [languageSuccess, setLanguageSuccess] = useState(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle default language selection
  const handleDefaultLanguageChange = (e) => {
    const selectedCode = e.target.value;
    setFormData({
      ...formData,
      defaultLanguage: selectedCode
    });
  };
  
  const removeLanguage = (index) => {
    const removedLanguage = formData.languages[index];
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      languages: newLanguages,
      // Clear default language if the removed language was the default
      defaultLanguage: formData.defaultLanguage === removedLanguage ? '' : formData.defaultLanguage
    });
  };

  // Handle opening the language assignment modal
  const handleAssignLanguagesClick = () => {
    setSelectedLanguageIds([]);
    setIsLanguageModalOpen(true);
  };

  // Handle individual checkbox selection
  const handleLanguageToggle = (languageId) => {
    setSelectedLanguageIds(prev => {
      if (prev.includes(languageId)) {
        return prev.filter(id => id !== languageId);
      } else {
        return [...prev, languageId];
      }
    });
  };

  // Handle batch assignment of selected languages
  const handleAssignSelectedLanguages = async () => {
    if (selectedLanguageIds.length > 0) {
      setIsAssigning(true);
      try {
        const selectedLanguages = availableLanguages
          .filter(lang => selectedLanguageIds.includes(lang._id))
          .map(lang => lang.code);
        
        const newLanguages = selectedLanguages.filter(code => !formData.languages.includes(code));
        
        if (newLanguages.length > 0) {
          setFormData({
            ...formData,
            languages: [...formData.languages, ...newLanguages]
          });
          
          const message = newLanguages.length === 1 
            ? `Language "${newLanguages[0]}" assigned successfully!`
            : `${newLanguages.length} languages assigned successfully!`;
          setLanguageSuccess(message);
          
          setTimeout(() => {
            setLanguageSuccess(null);
          }, 3000);
        }
        
        setSelectedLanguageIds([]);
        setIsLanguageModalOpen(false);
      } catch (error) {
        console.error('Error assigning languages:', error);
      } finally {
        setIsAssigning(false);
      }
    }
  };

  // Get available languages for default language dropdown (only assigned languages)
  const getAssignedLanguageObjects = () => {
    return availableLanguages.filter(lang => formData.languages.includes(lang.code));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setLanguageSuccess(null);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      setIsSubmitting(false);
      return;
    }

    // Validate default language if provided
    if (formData.defaultLanguage && !formData.languages.includes(formData.defaultLanguage)) {
      setError('Default language must be one of the assigned languages');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Debug: Check what's in the user object
      console.log('Current user from context:', user);
      console.log('User ID (_id):', user?._id);
      console.log('User ID (id):', user?.id);
      
      // Try to get user ID from different sources
      let userId = user?._id || user?.id;
      
      // If no direct ID, try to extract from JWT token
      if (!userId && user?.token) {
        console.log('No user ID in context, trying to extract from JWT token...');
        try {
          // Decode JWT token to get user ID
          const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
          console.log('JWT token payload:', tokenPayload);
          userId = tokenPayload.id || tokenPayload._id || tokenPayload.userId;
          console.log('Extracted user ID from JWT:', userId);
        } catch (jwtError) {
          console.error('Failed to decode JWT token:', jwtError);
        }
      }
      
      // Check if we have a user ID
      if (!userId) {
        setError('You must be logged in to create a project. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare project data - include user ID and default language (required by backend)
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        languages: formData.languages,
        createdBy: userId,
        // Include default language only if one is selected
        ...(formData.defaultLanguage && { defaultLanguage: formData.defaultLanguage })
      };
      
      console.log('Submitting project data:', projectData);
      const result = await projectService.addProject(projectData);
      console.log('Project created successfully:', result);
      
      let successMessage = 'Project created successfully!';
      if (result.notificationStatus === 'email_failed') {
        successMessage = 'Project created successfully! (Note: Email notifications could not be sent)';
      }
      
      // Add default language info to success message if set
      if (formData.defaultLanguage) {
        const defaultLangName = availableLanguages.find(lang => lang.code === formData.defaultLanguage)?.name;
        successMessage += ` Default language set to ${defaultLangName || formData.defaultLanguage}.`;
      }
      
      setSuccess(successMessage);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        languages: [],
        defaultLanguage: ''
      });
      
      // Keep success message visible for 4 seconds before calling onSuccess
      setTimeout(() => {
        // Notify parent component immediately to refresh the list
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error creating project:', err);
      
      // More detailed error handling
      let errorMessage = 'Failed to create project';
      
      if (err.response) {
        // Server responded with error status
        const responseData = err.response.data;
        
        // Check if this is an email sending failure but project was actually created
        if (err.response.status === 500 && 
            responseData?.error === 'Email sending failed' && 
            responseData?.message === 'Error creating project') {
          // Project might have been created despite the error
          setSuccess('Project created successfully! (Note: Email notifications could not be sent)');
          
          // Reset form
          setFormData({
            name: '',
            description: '',
            languages: [],
            defaultLanguage: ''
          });
          
          // Keep success message visible for 4 seconds before calling onSuccess
          setTimeout(() => {
            // Notify parent component to refresh the list
            if (onSuccess) {
              onSuccess();
            }
          }, 2000);
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 5000);
          return;
        }
        
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err.message) {
        // Network or other error
        errorMessage = err.message;
      }
      
      // Check for specific common issues
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}
      
      {languageSuccess && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md border border-blue-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {languageSuccess}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
            Project Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter project name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter project description (optional)"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">
            Assign Languages
          </label>
          
          {/* Assign Languages Button */}
          <div className="mb-4">
            <Button
              onClick={handleAssignLanguagesClick}
              className="bg-brand-purple-base hover:bg-purple-700 text-white !py-2.5 !px-4"
              disabled={availableLanguages.length === 0}
            >
              + Assign Languages
            </Button>
            {availableLanguages.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No languages available. Please add languages in the Language Management section first.
              </p>
            )}
          </div>
          
          {/* Selected Languages Display */}
          {formData.languages.length > 0 && (
            <div className="mb-3">
              <p className="font-medium text-gray-700 mb-2">Assigned Languages:</p>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <div 
                    key={index} 
                    className={`px-3 py-1 rounded-md flex items-center ${
                      formData.defaultLanguage === lang
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {lang}
                      {formData.defaultLanguage === lang && (
                        <span className="ml-1 text-xs">(Default)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className={`ml-2 hover:opacity-70 focus:outline-none ${
                        formData.defaultLanguage === lang ? 'text-green-500' : 'text-indigo-500'
                      }`}
                      title="Remove language"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Default Language Selection */}
        {formData.languages.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="defaultLanguage">
              Default Language
            </label>
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              value={formData.defaultLanguage}
              onChange={handleDefaultLanguageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select default language (optional)</option>
              {getAssignedLanguageObjects().map((lang, index) => (
                <option key={`${lang._id}-${index}`} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              The default language will be used as the primary language for this project.
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            onClick={() => onSuccess && onSuccess()}
            disabled={isSubmitting}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 !py-2 !px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed !py-2 !px-4"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Adding...
              </>
            ) : (
              'Add Project'
            )}
          </Button>
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
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No languages available</p>
            <p className="text-sm text-gray-400">
              Please add languages in the Language Management section first.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-3">Available Languages</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select multiple languages to assign to this project:
            </p>
            
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {availableLanguages
                .filter(lang => !formData.languages.includes(lang.code))
                .map((lang, index) => {
                  const isSelected = selectedLanguageIds.includes(lang._id);
                  
                  return (
                    <div
                      key={`${lang._id}-${index}`}
                      className={`flex items-center py-3 px-2 rounded transition-colors hover:bg-gray-50 cursor-pointer ${
                        index < availableLanguages.filter(l => !formData.languages.includes(l.code)).length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                      onClick={() => !isAssigning && handleLanguageToggle(lang._id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAssigning}
                        onChange={() => handleLanguageToggle(lang._id)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-700">
                          <span className="font-semibold">{lang.code}</span>
                          <span className="ml-1">- {lang.name || 'No description'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            
            {/* Assignment Button */}
            {selectedLanguageIds.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedLanguageIds.length} language{selectedLanguageIds.length > 1 ? 's' : ''} selected
                </p>
                <Button
                  onClick={handleAssignSelectedLanguages}
                  disabled={isAssigning}
                  className="bg-purple-600 text-white hover:bg-purple-700 !py-2 !px-4"
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Languages'
                  )}
                </Button>
              </div>
            )}
            
            {availableLanguages.filter(lang => !formData.languages.includes(lang.code)).length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">All available languages have been assigned to this project.</p>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default AddProject;