import axios from 'axios';
import { API_BASE } from '../config/env'; // Assuming you create this file on the frontend as well

const AUTH_API_URL = `${API_BASE}/api/auth`;

// This function will be called by the useLogin hook
const login = async (email, password) => {
    // Axios automatically handles non-2xx responses as errors, simplifying the hook
    const response = await axios.post(`${AUTH_API_URL}/login`, { email, password });
    return response.data; // The hook will receive the user data
};

// This function will be called by the useRegister hook
const register = async (userName, email, password, role, languages) => {
    const response = await axios.post(`${AUTH_API_URL}/register`, {
        userName,
        email,
        password,
        role,
        languages,
    });
    return response.data;
};

// This function will be called from the Sidebar
const logout = async () => {
    // The backend route is GET /api/auth/logout
    const response = await axios.get(`${AUTH_API_URL}/logout`);
    return response.data;
};

const authService = {
    login,
    register,
    logout,
};

export default authService;