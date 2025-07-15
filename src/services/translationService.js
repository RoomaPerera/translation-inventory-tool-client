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

// Translation-related API services
const translationService = {
  // Export API_URL for reference in error messages
  API_URL,

  // Get translations with optional filtering
  getTranslations: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/translations${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      throw handleApiError(error);
    }
  },

  // Add a new translation
  addTranslation: async (translationData) => {
    try {
      const response = await apiClient.post('/translations', translationData);
      return response.data;
    } catch (error) {
      console.error('Failed to add translation:', error);
      throw handleApiError(error);
    }
  },

  // Update a translation
  updateTranslation: async (translationId, translationData) => {
    try {
      const response = await apiClient.put(`/translations/${translationId}`, translationData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update translation ${translationId}:`, error);
      throw handleApiError(error);
    }
  },

  // Generate translation files (REQ-19)
  generateTranslationFiles: async (projectId, format = 'json') => {
    try {
      console.log(`Generating ${format} translations for project ${projectId}`);
      const response = await apiClient.get(`/developer/projects/${projectId}/translations/generate`, {
        params: { format },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      
      return {
        blob,
        filename: response.headers['content-disposition'] 
          ? response.headers['content-disposition'].split('filename=')[1]
          : `translations.${format}`
      };
    } catch (error) {
      console.error(`Failed to generate ${format} translations:`, error);
      throw handleApiError(error);
    }
  },

  // Upload translation files (REQ-20)
  uploadTranslationFile: async (projectId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Uploading translation file for project ${projectId}`);
      const response = await apiClient.post(`/developer/projects/${projectId}/translations/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Translation file uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to upload translation file:', error);
      throw handleApiError(error);
    }
  },

  // Helper function to download file
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

export default translationService;
