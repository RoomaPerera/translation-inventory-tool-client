// services/userService.js
import axiosInstance from './axiosInstance';

/**
 * Updates the list of assigned languages for a specific user.
 */
const assignLanguagesToUser = (userId, languages) => {
    return axiosInstance.patch(`/users/${userId}/languages`, { languages });
};

/**
 * Fetches the list of all users with a 'Pending' status.
 */
const getPendingUsers = () => {
    return axiosInstance.get('/users/pending');
};

/**
 * Approves or rejects a pending user registration.
 * REQ-6
 */
const updateUserApproval = (userId, isApproved) => {
    // FIXED: Route to match backend userRoutes.js
    return axiosInstance.patch(`/users/${userId}/approve`, { approve: isApproved });
};

/**
 * Deletes a user.
 */
const deleteUser = (userId) => {
    return axiosInstance.delete(`/users/delete/${userId}`);
};

/**
 * Fetches a list of all non-deleted users.
 */
const getAllUsers = () => {
    return axiosInstance.get('/users');
};

const userService = {
    assignLanguagesToUser,
    getPendingUsers,
    updateUserApproval,
    deleteUser,
    getAllUsers,
};

export default userService;