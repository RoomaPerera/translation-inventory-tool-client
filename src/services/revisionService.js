// services/revisionService.js
import axiosInstance from './axiosInstance';

const revisionService = {
    getRevisions: async (translationId) => {
        const response = await axiosInstance.get(`/translations/revisions/${translationId}`);
        return response.data;
    },

    getDiff: async (translationId, revIndex) => {
        const response = await axiosInstance.get(`/translations/diff/${translationId}/${revIndex}`);
        return response.data;
    },

    revertRevision: async (translationId, revIndex) => {
        const response = await axiosInstance.post(`/translations/revert/${translationId}/${revIndex}`);
        return response.data;
    }
};

export default revisionService;