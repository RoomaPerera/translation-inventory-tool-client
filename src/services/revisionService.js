// services/revisionService.js - FIXED VERSION
import axiosInstance from './axiosInstance';

const revisionService = {
    getRevisions: async (translationId) => {
        const response = await axiosInstance.get(`/translations/${translationId}/revisions`);
        return response.data;
    },

    getDiff: async (translationId, revIndex) => {
        const response = await axiosInstance.get(`/translations/${translationId}/diff/${revIndex}`);
        return response.data;
    },

    revertRevision: async (translationId, revIndex) => {
        const response = await axiosInstance.post(`/translations/${translationId}/revert/${revIndex}`);
        return response.data;
    }
};

export default revisionService;