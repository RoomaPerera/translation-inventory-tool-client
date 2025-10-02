//services/axiosInstance.js
import axios from 'axios';
import { API_BASE } from '../config/env';

const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
    timeout: 120000, // Extended to 120 seconds (2 minutes) for consistency
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('🚀 Making API request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            withCredentials: config.withCredentials,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging and error handling
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ API response success:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API response error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message
        });
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            console.error('🔒 Authentication failed - redirecting to login');
            // Don't auto-redirect here as it might cause infinite loops
            // Let the component handle this
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;