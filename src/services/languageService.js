import axios from 'axios';

// API base URL 
const API_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 
});

// Language-related API services
const languageService = {
  // Export API_URL for reference in error messages
  API_URL,
  
  // Get all languages
  getLanguages: async () => {
    try {
      const response = await apiClient.get('/languages');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      throw handleApiError(error);
    }
  },
  
  // Add a new language
  addLanguage: async (languageData) => {
    try {
      const response = await apiClient.post('/languages', languageData);
      return response.data;
    } catch (error) {
      console.error('Failed to add language:', error);
      throw handleApiError(error);
    }
  },
  
  // Update language
  updateLanguage: async (id, data) => {
    try {
      const response = await apiClient.put(`/languages/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update language ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Delete language
  deleteLanguage: async (id) => {
    try {
      const response = await apiClient.delete(`/languages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete language ${id}:`, error);
      throw handleApiError(error);
    }
  }
};

// Helper function to handle API errors 
function handleApiError(error) {
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return error.response.data || { 
      message: `Server error: ${error.response.status} ${error.response.statusText}` 
    };
  } else if (error.request) {
    console.error('No response received:', error.request);
    return { 
      message: 'No response from server. Please check if your backend is running and accessible.' 
    };
  } else {
    console.error('Error message:', error.message);
    return { 
      message: `Error: ${error.message}` 
    };
  }
}

export default languageService;