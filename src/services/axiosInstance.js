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

export default axiosInstance;