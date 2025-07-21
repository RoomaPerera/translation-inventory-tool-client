// services/nlpService.js
import axiosInstance from './axiosInstance';

const getSuggestions = (text, product) => {
    return axiosInstance.post('/nlp/suggest', { text, product });
};

const getGlossary = (text) => {
    return axiosInstance.post('/nlp/glossary', { text });
};

const nlpService = {
    getSuggestions,
    getGlossary,
};

export default nlpService;