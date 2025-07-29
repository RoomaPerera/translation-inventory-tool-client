// services/userService.js
import axiosInstance from './axiosInstance';

/**
 * Updates the list of assigned languages for a specific user.
 */
const assignLanguagesToUser = (userId, languages) => {
    return axiosInstance.put(`/users/modifyLanguages/${userId}`, { languages });
};

/**
 * Alias for assignLanguagesToUser to match UserList.jsx usage
 */
const modifyLanguages = (userId, languages) => {
    return assignLanguagesToUser(userId, languages);
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
 * Alias for getUserList to match UserList.jsx usage
 */
const getAllUsers = () => {
    return getUserList().then(response => response.data);
};

/**
 * Filters active users by role
 */
const filterUserList = (role) => {
    return axiosInstance.get(`/users/filterUserList/${role}`);
};
/**
 * Alias for filterUserList to match UserList.jsx usage
 */
const getUsersByRole = (role) => {
    return filterUserList(role).then(response => response.data);
};

/**
 * Approves or rejects a pending user registration.
 * REQ-6
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
/**
 * Updates a pending user's role and status
 */
const updatePendingUser = (userId, role, approve) => {
    if (approve) {
        // First update the role if it's different, then approve
        return axiosInstance.put(`/users/${userId}/approve`, { approve: true, role });
    } else {
        return axiosInstance.put(`/users/${userId}/reject`);
    }
};

const userService = {
    assignLanguagesToUser,
    getPendingUsers,
    updateUserApproval,
    deleteUser,
    getUserList,
    filterUserList,
    getUser,
    updatePendingUser,
    getUsersByRole,
    getAllUsers,
    modifyLanguages
};

export default userService;