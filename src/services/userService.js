// services/userService.js
import axiosInstance from './axiosInstance';

/**
 * Updates the list of assigned languages for a specific user.
 */
const assignLanguagesToUser = (userId, languages) => {
    return axiosInstance.put(`/users/modify-languages/${userId}`, { languages });
};

/**
 * Fetches the list of all users with a 'Pending' status.
 */
const getPendingUsers = () => {
    return axiosInstance.get('/users/pending');
};

/**
 * Approves a pending user registration.
 */
const approveUser = (userId) => {
    return axiosInstance.put('/users/approve', { id: userId, approve: true });
};

/**
 * Rejects a pending user registration.
 */
const rejectUser = (userId) => {
    return axiosInstance.put('/users/approve', { id: userId, approve: false });
};

/**
 * Deletes a user.
 */
const deleteUser = (userId) => {
    return axiosInstance.delete(`/users/delete/${userId}`);
};

const userService = {
    assignLanguagesToUser,
    getPendingUsers,
    approveUser,
    rejectUser,
    deleteUser,
};

export default userService;