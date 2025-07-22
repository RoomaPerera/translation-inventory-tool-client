import axios from 'axios';
import { API_BASE } from '../config/env';

const API_URL = `${API_BASE}/api/translations`;

// --- THIS IS THE CORRECTED FUNCTION ---
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


// --- The rest of the file remains unchanged ---
const addTranslation = (translationData) => {
  return axios.post(API_URL, translationData);
};

const updateTranslation = (id, updatedData) => {
  return axios.put(`${API_URL}/${id}`, updatedData);
};

const deleteTranslation = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

const translationService = {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
};

export default translationService;