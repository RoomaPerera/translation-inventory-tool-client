// Updated fuzzySearchService.js
import axiosInstance from './axiosInstance';

const fuzzySearchService = {
    /**
     * Perform fuzzy search on translations
     * @param {string} query - The search query
     * @param {string} type - The type of search (project, language, key, text)
     * @returns {Promise} - The search results
     */
    searchTranslations: async (query, type) => {
        try {
            // Add minimum query length check to reduce unnecessary API calls
            if (!query || query.trim().length < 1) {
                return [];
            }

            const response = await axiosInstance.get('/fuzzy-search', {
                params: { query: query.trim(), type },
                // Add timeout for better UX
                timeout: 5000
            });
            
            return response.data || [];
        } catch (error) {
            console.error('Fuzzy search failed:', error);
            // Return empty array instead of throwing to prevent UI breaks
            return [];
        }
    },

    /**
     * Search for similar translation keys
     * @param {string} query - The search query
     * @returns {Promise} - The search results
     */
    searchKeys: async (query) => {
        return fuzzySearchService.searchTranslations(query, 'key');
    },

    /**
     * Search for similar translated text
     * @param {string} query - The search query
     * @returns {Promise} - The search results
     */
    searchText: async (query) => {
        return fuzzySearchService.searchTranslations(query, 'text');
    },

    /**
     * Search for similar projects
     * @param {string} query - The search query
     * @returns {Promise} - The search results
     */
    searchProjects: async (query) => {
        return fuzzySearchService.searchTranslations(query, 'project');
    },

    /**
     * Search for similar languages
     * @param {string} query - The search query
     * @returns {Promise} - The search results
     */
    searchLanguages: async (query) => {
        return fuzzySearchService.searchTranslations(query, 'language');
    },

    /**
     * Clear any cached results (if you implement client-side caching)
     */
    clearCache: () => {
        // Implementation depends on your caching strategy
        console.log('Cache cleared');
    }
};

export default fuzzySearchService;