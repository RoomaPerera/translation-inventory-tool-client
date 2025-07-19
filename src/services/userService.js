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

// User-related API services
const userService = {
  // Export API_URL for reference in error messages
  API_URL,

  // Get all users
  getUserList: async () => {
    try {
      const response = await apiClient.get('/users/getUserList');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw handleApiError(error);
    }
  },

  // Get users by role (filter)
  filterUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/users/filterUserList/${role}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch users with role ${role}:`, error);
      throw handleApiError(error);
    }
  },

  // Get pending users
  getPendingUsers: async () => {
    try {
      const response = await apiClient.get('/users/pendingUsers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      throw handleApiError(error);
    }
  },

  // Approve a user
  approveUser: async (userId) => {
    try {
      const response = await apiClient.put(`/users/approveUser/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to approve user ${userId}:`, error);
      throw handleApiError(error);
    }
  },

  // Assign languages to a user (translator)
  assignLanguages: async (userId, languages) => {
    try {
      console.log(`Assigning languages to user ${userId}:`, languages);
      const response = await apiClient.post(`/users/${userId}/assign-languages`, { languages });
      console.log('Languages assigned successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to assign languages to user ${userId}:`, error);
      throw handleApiError(error);
    }
  },

  // Admin assign languages to user (alternative endpoint)
  adminAssignLanguages: async (userId, languages) => {
    try {
      console.log(`Admin assigning languages to user ${userId}:`, languages);
      const response = await apiClient.post(`/admin/users/${userId}/languages`, { languages });
      console.log('Languages assigned successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to assign languages to user ${userId}:`, error);
      throw handleApiError(error);
    }
  },

  // Modify languages for a user
  modifyLanguages: async (userId, languages) => {
    try {
      console.log(`Modifying languages for user ${userId}:`, languages);
      const response = await apiClient.put(`/users/modifyLanguages/${userId}`, { languages });
      console.log('Languages modified successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to modify languages for user ${userId}:`, error);
      throw handleApiError(error);
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      console.log(`Deleting user ${userId}`);
      const response = await apiClient.delete(`/users/deleteUser/${userId}`);
      console.log('User deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
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

export default userService;