// services/translationService.js
import axiosInstance from './axiosInstance';

const getTranslations = (page = 1, limit = 10) => {
  return axiosInstance.get('/translations', { params: { page, limit } });
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