import { useState } from 'react';
import languageService from '../../services/languageService';

const LanguageForm = ({ onSuccess, existingLanguages = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Convert language code to uppercase
    const codeUppercase = formData.code.toUpperCase();
    
    // Validate language code format (e.g., EN, FR, ES)
    const codeRegex = /^[A-Z]{2,3}$/;
    if (!codeRegex.test(formData.code)) {
      setError('Language code must be 2-3 uppercase letters (e.g., EN, FR, ES)');
      setIsSubmitting(false);
      return;
    }
    
    // Check if language already exists
    const languageExists = existingLanguages.some(
      lang => lang.code.toLowerCase() === formData.code.toLowerCase() || 
              lang.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (languageExists) {
      setError(`Language with this name or code already exists`);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await languageService.addLanguage(formData);
      setSuccess('Language added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        code: ''
      });
      
      // Notify parent component after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error adding language:', err);
      setError(err.message || 'Failed to add language');
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
            Language Name* <span className="text-sm text-gray-500">(e.g., English, French, Spanish)</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="English"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="code">
            Language Code* <span className="text-sm text-gray-500">(e.g., EN, FR, ES)</span>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            placeholder="EN"
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            style={{ textTransform: 'uppercase' }}
          />
          <p className="mt-1 text-sm text-gray-500">
            Must be 2-3 uppercase letters, unique for each language.
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
            {isSubmitting ? 'Adding...' : 'Add Language'}
          </button>
        </div>
      </form>
    </>
  );
};

export default LanguageForm;