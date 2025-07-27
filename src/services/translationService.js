import API from './axiosInstance'; // Use the central, configured axios instance for all calls

/**
 * REQ-9, 10, 11: Get translations with pagination and filtering.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @param {object} filters - An object containing filter criteria (e.g., { key, language, projectId }).
 * @returns {Promise} - The axios promise for the request.
 */
const getTranslations = (page = 1, limit = 10, filters = {}) => {
    const params = {
        page,
        limit,
        ...filters
    };
    // All API calls now go through the secure instance
    return API.get('/translations', { params });
};

/**
 * REQ-8: Add a new translation.
 * @param {object} translationData - The data for the new translation.
 * @returns {Promise} - The axios promise for the request.
 */
const addTranslation = (translationData) => {
    return API.post('/translations', translationData);
};

/**
 * REQ-8: Update an existing translation.
 * @param {string} id - The ID of the translation to update.
 * @param {object} updatedData - The new data for the translation.
 * @returns {Promise} - The axios promise for the request.
 */
const updateTranslation = (id, updatedData) => {
    return API.put(`/translations/${id}`, updatedData);
};

/**
 * REQ-12: Delete a translation.
 * @param {string} id - The ID of the translation to delete.
 * @returns {Promise} - The axios promise for the request.
 */
const deleteTranslation = (id) => {
    return API.delete(`/translations/${id}`);
};

const translationService = {
    getTranslations,
    addTranslation,
    updateTranslation,
    deleteTranslation,
};

export default translationService;