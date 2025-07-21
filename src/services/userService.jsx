import axios from 'axios';
import { API_BASE } from '../config/env';

const USER_API_URL = `${API_BASE}/api/users`;

/**
 * Updates the list of assigned languages for a specific user.
 * Matches the backend route: PUT /api/users/modify-languages/:id
 * @param {string} userId - The ID of the user to update.
 * @param {string[]} languages - An array of language codes to assign.
 * @returns {Promise<Object>} The response data from the server.
 */
const assignLanguagesToUser = (userId, languages) => {
    return axios.put(`${USER_API_URL}/modify-languages/${userId}`, { languages });
};

/**
 * Fetches the list of all users with a 'Pending' status.
 * Matches the backend route: GET /api/users/pending
 * @returns {Promise<Object>} A list of pending user objects.
 */
const getPendingUsers = () => {
    return axios.get(`${USER_API_URL}/pending`);
};

/**
 * Approves a pending user registration.
 * Matches the backend route: PUT /api/users/approve
 * @param {string} userId - The ID of the user to approve.
 * @returns {Promise<Object>} The success message from the server.
 */
const approveUser = (userId) => {
    return axios.put(`${USER_API_URL}/approve`, { id: userId, approve: true });
};

/**
 * Rejects a pending user registration.
 * Matches the backend route: PUT /api/users/approve (with approve: false)
 * @param {string} userId - The ID of the user to reject.
 * @returns {Promise<Object>} The success message from the server.
 */
const rejectUser = (userId) => {
    return axios.put(`${USER_API_URL}/approve`, { id: userId, approve: false });
};

/**
 * Deletes a user.
 * Matches the backend route: DELETE /api/users/delete/:id
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<Object>} The success message from the server.
 */
const deleteUser = (userId) => {
    return axios.delete(`${USER_API_URL}/delete/${userId}`);
};


// Consolidate all functions into a single service object for export
const userService = {
    assignLanguagesToUser,
    getPendingUsers,
    approveUser,
    rejectUser,
    deleteUser,
};

export default userService;