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
  timeout: 10000,
  withCredentials: true // Important: Include cookies in requests
});

// Add a request interceptor for debugging
apiClient.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('Request payload:', config.data);
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging and error handling
apiClient.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  error => {
    console.error('Response error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Language-related API services
const languageService = {
  // Export API_URL for reference in error messages
  API_URL,
  
  // Get all languages
  getLanguages: async () => {
    try {
      console.log('Fetching all languages...');
      const response = await apiClient.get('/languages');
      
      // Handle different response formats
      let languages = response.data;
      if (response.data.languages) {
        languages = response.data.languages;
      } else if (response.data.data) {
        languages = response.data.data;
      }
      
      console.log('Languages fetched successfully:', languages.length, 'languages');
      return Array.isArray(languages) ? languages : [];
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      throw handleApiError(error);
    }
  },
  
  // Get language by ID
  getLanguageById: async (id) => {
    try {
      console.log(`Fetching language by ID: ${id}`);
      const response = await apiClient.get(`/languages/${id}`);
      console.log(`Language fetched successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch language ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Add a new language
  addLanguage: async (languageData) => {
    try {
      console.log('Adding new language:', languageData);
      
      // Validate required fields
      if (!languageData.name || !languageData.code) {
        throw new Error('Language name and code are required');
      }
      
      const response = await apiClient.post('/languages', languageData);
      console.log('Language added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add language:', error);
      throw handleApiError(error);
    }
  },
  
  // Update language
  updateLanguage: async (id, data) => {
    try {
      console.log(`Updating language ${id}:`, data);
      const response = await apiClient.put(`/languages/${id}`, data);
      console.log(`Language ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update language ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Delete language
  deleteLanguage: async (id) => {
    try {
      console.log(`Deleting language ${id}...`);
      const response = await apiClient.delete(`/languages/${id}`);
      console.log(`Language ${id} deleted successfully`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete language ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Search languages by name or code
  searchLanguages: async (query) => {
    try {
      console.log(`Searching languages with query: ${query}`);
      const response = await apiClient.get(`/languages/search?q=${encodeURIComponent(query)}`);
      
      let languages = response.data;
      if (response.data.languages) {
        languages = response.data.languages;
      } else if (response.data.data) {
        languages = response.data.data;
      }
      
      console.log(`Language search completed: ${languages.length} results`);
      return Array.isArray(languages) ? languages : [];
    } catch (error) {
      console.error('Failed to search languages:', error);
      throw handleApiError(error);
    }
  },
  
  // Check if language code is available
  checkLanguageCodeAvailability: async (code) => {
    try {
      console.log(`Checking availability of language code: ${code}`);
      const response = await apiClient.get(`/languages/check-code/${code}`);
      console.log(`Language code availability checked:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to check language code availability:`, error);
      throw handleApiError(error);
    }
  },
  
  // Get languages with statistics (if backend supports it)
  getLanguagesWithStats: async () => {
    try {
      console.log('Fetching languages with statistics...');
      const response = await apiClient.get('/languages/stats');
      console.log('Languages with stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch languages with stats:', error);
      // Fall back to regular getLanguages if stats endpoint doesn't exist
      if (error.response?.status === 404) {
        console.log('Stats endpoint not available, falling back to regular languages');
        return await languageService.getLanguages();
      }
      throw handleApiError(error);
    }
  },
  
  // Bulk operations
  bulkAddLanguages: async (languagesArray) => {
    try {
      console.log(`Bulk adding ${languagesArray.length} languages...`);
      const response = await apiClient.post('/languages/bulk', { languages: languagesArray });
      console.log(`Bulk language addition completed:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to bulk add languages:', error);
      throw handleApiError(error);
    }
  },
  
  bulkDeleteLanguages: async (languageIds) => {
    try {
      console.log(`Bulk deleting ${languageIds.length} languages...`);
      const response = await apiClient.delete('/languages/bulk', { 
        data: { ids: languageIds } 
      });
      console.log(`Bulk language deletion completed`);
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete languages:', error);
      throw handleApiError(error);
    }
  }
};

// Helper function to handle API errors with enhanced error messages
function handleApiError(error) {
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    
    // Handle specific error status codes
    switch (error.response.status) {
      case 400:
        return error.response.data || { 
          message: 'Bad request. Please check your input data.' 
        };
      case 401:
        return { 
          message: 'Unauthorized. Please login again.' 
        };
      case 403:
        return { 
          message: 'Forbidden. You do not have permission to perform this action.' 
        };
      case 404:
        return { 
          message: 'Language not found or endpoint does not exist.' 
        };
      case 409:
        return error.response.data || { 
          message: 'Conflict. Language code might already exist.' 
        };
      case 422:
        return error.response.data || { 
          message: 'Validation error. Please check your input data.' 
        };
      case 500:
        return { 
          message: 'Internal server error. Please try again later.' 
        };
      default:
        return error.response.data || { 
          message: `Server error: ${error.response.status} ${error.response.statusText}` 
        };
    }
  } else if (error.request) {
    console.error('No response received:', error.request);
    return { 
      message: 'No response from server. Please check if your backend is running and accessible at ' + API_URL 
    };
  } else {
    console.error('Error message:', error.message);
    return { 
      message: `Network error: ${error.message}` 
    };
  }
}

export default languageService;