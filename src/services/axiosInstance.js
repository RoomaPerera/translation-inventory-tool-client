//services/axiosInstance.js
import axios from 'axios';
import { API_BASE } from '../config/env';

const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;