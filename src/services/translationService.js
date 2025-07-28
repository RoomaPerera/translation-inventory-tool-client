// services/translationService.js - FIXED VERSION
import axiosInstance from './axiosInstance';

const getTranslations = (page = 1, limit = 10, filters = {}) => {
    // 1. Start with the base pagination parameters.
    const params = {
        page,
        limit,
    };

    // 2. Add the filter parameters to the same object.
    //    The backend controller expects `key` and `language`.
    if (filters.key) {
        params.key = filters.key;
    }
    if (filters.language) {
        params.language = filters.language;
    }
    if (filters.product) {
        params.product = filters.product;
    }
    if (filters.word) {
        params.word = filters.word;
    }
    if (filters.status) {
        params.status = filters.status;
    }
    if (filters.myWork) {
        params.myWork = filters.myWork;
    }
    if (filters.projectId) {
        params.projectId = filters.projectId;
    }

    // 3. Pass the entire `params` object to axiosInstance.
    //    This ensures proper authentication and base URL configuration
    return axiosInstance.get('/translations', { params });
};

const addTranslation = (translationData) => {
    return axiosInstance.post('/translations', translationData);
};

const updateTranslation = (id, updatedData) => {
    return axiosInstance.put(`/translations/${id}`, updatedData);
};

const deleteTranslation = (id) => {
    return axiosInstance.delete(`/translations/${id}`);
};

const translationService = {
    getTranslations,
    addTranslation,
    updateTranslation,
    deleteTranslation,
};

export default translationService;