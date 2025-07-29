// services/userService.js
import axiosInstance from './axiosInstance';

/**
 * Updates the list of assigned languages for a specific user.
 */
const assignLanguagesToUser = (userId, languages) => {
    return axiosInstance.put(`/users/modifyLanguages/${userId}`, { languages });
};

/**
 * Fetches the list of all users with a 'Pending' status.
 */
const getPendingUsers = () => {
    return axiosInstance.get('/users/getPendingUsers');
};
/**
 * Fetches the list of all active users
 */
const getUserList = () => {
    return axiosInstance.get('/users/getUserList');
};
/**
 * Filters active users by role
 */
const filterUserList = (role) => {
    return axiosInstance.get(`/users/filterUserList/${role}`);
};

/**
 * Approves a pending user registration.
 */
const approveUser = (userId) => {
    return axiosInstance.put(`/users/${userId}/approve`, { approve: true });
};

/**
 * Rejects a pending user registration.
 */
const rejectUser = (userId) => {
    return axiosInstance.put(`/users/${userId}/reject`);
};

/**
 * Deletes a user.
 */
const deleteUser = (userId) => {
    return axiosInstance.delete(`/users/deleteUser/${userId}`);
};
/**
 * get a user. (for real-time collaboration)
 */
const getUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`/users/getUser/${userId}`);
        return response.data.user;
    } catch (error) {
        console.warn('Failed to fetch user:', error);
        return null;
    }
};

const userService = {
    assignLanguagesToUser,
    getPendingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    getUserList,
    filterUserList,
    getUser
};

export default userService;