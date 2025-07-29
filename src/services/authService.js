import API from './axiosInstance';

// Register a new user (self-registration, pending approval)
export const registerUser = (userName, email, password, role, languages) => {
    return API.post('/auth/register', {
        userName,
        email,
        password,
        role,
        languages
    });
};

// Login a user (returns     cookie with JWT)
export const loginUser = (credentials) =>
    API.post('/auth/login', credentials);

// Logout the currently logged-in user
export const logoutUser = () =>
    API.get('/auth/logout');

// Request a password reset email (forgot password)
export const resetPassword = (email) =>
    API.post('/auth/resetPassword', { email });

// Set a new password via reset link
export const setNewPassword = (data) =>
    API.post('/auth/setNewPassword', data);

// Change password for logged-in user
export const changePassword = (data) =>
    API.post('/auth/changePassword', data);

// Get list of all available languages (for registration)
export const getLanguages = () =>
    API.get('/auth/getLanguages').then(res => res.data.languages);

const authService = {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    setNewPassword,
    changePassword,
    getLanguages
};

export default authService;