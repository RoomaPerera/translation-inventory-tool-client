import axios from 'axios';
import { API_BASE } from '../config/env';

const NLP_API_URL = `${API_BASE}/api/nlp`;

// Updated to match the new backend controller logic
const getSuggestions = (text, product) => {
    return axios.post(`${NLP_API_URL}/suggest`, { text, product });
};

const getGlossary = (text) => {
    return axios.post(`${NLP_API_URL}/glossary`, { text });
};

const nlpService = {
    getSuggestions,
    getGlossary,
};

export default nlpService;