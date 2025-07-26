import axios from 'axios'; // To make HTTP requests

// API base URL 
const API_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // Increased timeout to 30 seconds for debugging
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

// Project-related API services
const projectService = {
  // Export API_URL for reference in error messages
  API_URL,
  
  // Test connection to the API
  testConnection: async () => {
    try {
      const response = await apiClient.get('/test');
      console.log('API test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API test failed:', error);
      throw handleApiError(error);
    }
  },
  
  // Add a new project
  addProject: async (projectData) => {
    try {
      console.log('Adding project:', projectData);
      const response = await apiClient.post('/projects', projectData); // Sends a POST request to /projects
      console.log('Project added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add project:', error);
      throw handleApiError(error);
    }
  },
  
  // Get all projects
  getProjects: async () => {
    try {
      const response = await apiClient.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw handleApiError(error);
    }
  },
  
  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch project ${id}:`, error);
      throw handleApiError(error);
    }
  },

    // Update a project
  updateProject: async (id, projectData) => {
    try {
      console.log(`Updating project ${id}:`, projectData);
      const response = await apiClient.put(`/projects/${id}`, projectData);
      console.log('Project updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update project ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Delete a project
  deleteProject: async (id) => {
    try {
      console.log(`Deleting project ${id}`);
      const response = await apiClient.delete(`/projects/${id}`);
      console.log('Project deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Assign multiple languages to a project
  assignLanguagesToProject: async (projectId, languageIds) => {
    try {
      console.log(`Assigning ${languageIds.length} languages to project ${projectId}:`, languageIds);
      const response = await apiClient.post(`/projects/${projectId}/languages`, {
        languages: languageIds
      });
      console.log('Languages assigned successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to assign languages to project ${projectId}:`, error);
      throw handleApiError(error);
    }
  },

  // Get languages assigned to a project
  getProjectLanguages: async (id) => {
    try {
      console.log('🟡 Making API call to get languages for project:', id);
      const response = await apiClient.get(`/projects/${id}/languages`);
      console.log('🟡 API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch languages for project ${id}:`, error);
      throw handleApiError(error);
    }
  },
  // Add these to your projectService object:

// Set default language for a project
setProjectDefaultLanguage: async (projectId, languageId) => {
  try {
    console.log(`Setting default language for project ${projectId}:`, languageId);
    const response = await apiClient.put(`/projects/${projectId}/default-language`, {
      languageId
    });
    console.log('Default language set successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to set default language for project ${projectId}:`, error);
    throw handleApiError(error);
  }
},

// Get default language for a project
getProjectDefaultLanguage: async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/default-language`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get default language for project ${projectId}:`, error);
    throw handleApiError(error);
  }
},

// Remove default language from a project
removeProjectDefaultLanguage: async (projectId) => {
  try {
    console.log(`Removing default language from project ${projectId}`);
    const response = await apiClient.delete(`/projects/${projectId}/default-language`);
    console.log('Default language removed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove default language from project ${projectId}:`, error);
    throw handleApiError(error);
  }
}
};

// Helper function to handle API errors
function handleApiError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return error.response.data || { 
      message: 'Server error: ${error.response.status} ${error.response.statusText}'
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return { 
      message: 'No response from server. Please check if your backend is running and accessible.' 
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
    return { 
      message: `Error: ${error.message}` 
    };
  }
}

export default projectService;