import axios from 'axios';
import { API_BASE } from '../config/env';

const API_URL = `${API_BASE}/api/translations`;

// --- THIS FUNCTION IS NOW UPDATED FOR PAGINATION ---
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
  
  // 3. Pass the entire `params` object to axios.
  //    Axios will automatically serialize this into a URL query string,
  //    e.g., /api/translations?page=1&limit=10&language=fr&key=welcome
  return axios.get(API_URL, { params });
};


// Add a new translation
const addTranslation = (translationData) => {
  return axios.post(API_URL, translationData);
};

// Update a translation (status or text)
const updateTranslation = (id, updatedData) => {
  return axios.put(`${API_URL}/${id}`, updatedData);
};

// We need to add a DELETE route to the backend for this to work.
// For now, this is what the frontend *should* call.
const deleteTranslation = (id) => {
    // This assumes we will add a DELETE /:id route to translationRoutes.js
    return axios.delete(`${API_URL}/${id}`);
};

const translationService = {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation, // Added for completeness
};

export default translationService;