import axios from 'axios';
import { API_BASE } from '../config/env';

const API_URL = `${API_BASE}/api/translations`;

// Utility to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // or sessionStorage
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
};

// --- GET translations with pagination ---
const getTranslations = (page = 1, limit = 10) => {
  return axios.get(API_URL, {
    params: { page, limit },
    ...getAuthHeaders()
  });
};

// --- POST new translation ---
const addTranslation = (translationData) => {
  return axios.post(API_URL, translationData, getAuthHeaders());
};

// --- PUT update translation ---
const updateTranslation = (id, updatedData) => {
  return axios.put(`${API_URL}/${id}`, updatedData, getAuthHeaders());
};

// --- DELETE translation ---
const deleteTranslation = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};

const translationService = {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
};

export default translationService;
