import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService'; // To interact with the project API

const AddProject = ({ onSuccess, availableLanguages = [] }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languages: []
  });
  
  const [newLanguage, setNewLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Modified addLanguage function to handle comma-separated languages
  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    
    // Process the input to handle multiple languages separated by commas
    const languagesToAdd = newLanguage
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => lang !== '');
    
    // Add each language if it doesn't already exist in the array
    const updatedLanguages = [...formData.languages];
    
    languagesToAdd.forEach(lang => {
      if (!updatedLanguages.includes(lang)) {
        updatedLanguages.push(lang);
      }
    });
    
    setFormData({
      ...formData,
      languages: updatedLanguages
    });
    
    setNewLanguage('');
  };
  
  const removeLanguage = (index) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    });
  };

  // Add Language directly from available languages
  const toggleLanguage = (langCode) => {
    if (formData.languages.includes(langCode)) {
      // Remove language if already selected
      setFormData({
        ...formData,
        languages: formData.languages.filter(code => code !== langCode)
      });
    } else {
      // Add language if not selected
      setFormData({
        ...formData,
        languages: [...formData.languages, langCode]
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For testing without auth, using a user ID
      const projectData = {
        ...formData,
        createdBy: "662fd0f66b8b6c795ecfe25f" 
      };
      
      console.log('Submitting project data:', projectData);
      const result = await projectService.addProject(projectData);
      setSuccess('Project created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        languages: []
      });
      
      // Notify parent component after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project. Check if the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Project Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Languages
          </label>
          
          {/* Available Languages Section */}
          {availableLanguages.length > 0 && (
            <div className="mb-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
              <p className="font-medium text-indigo-700 mb-2">Available Languages</p>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(lang => (
                  <span 
                    key={lang._id}
                    className={`inline-block px-3 py-1.5 rounded cursor-pointer transition-colors
                      ${formData.languages.includes(lang.code) 
                        ? 'bg-indigo-200 text-indigo-800 border border-indigo-400' 
                        : 'bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50'}`}
                    onClick={() => toggleLanguage(lang.code)}
                  >
                    <span className="font-medium">{lang.code}</span>
                    <span className="ml-1 text-sm">- {lang.name}</span>
                    {formData.languages.includes(lang.code) && 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    }
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-indigo-600">
                Click on a language to select or deselect it
              </p>
            </div>
          )}
          
          {/* Selected Languages Display */}
          {formData.languages.length > 0 && (
            <div className="mb-3">
              <p className="font-medium text-gray-700 mb-2">Selected Languages:</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.languages.map((lang, index) => (
                  <div 
                    key={index} 
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md flex items-center"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700"
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
          
          {/* Manual Language Entry */}
          <div className="flex">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add languages (e.g., EN, FR, ES)"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage();
                }
              }}
            />
            <button
              type="button"
              onClick={addLanguage}
              className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Add custom languages by typing codes separated by commas (e.g., EN, FR, ES)
          </p>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => onSuccess && onSuccess()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddProject;