import API from './axiosInstance'; // Use the central, configured axios instance for all calls

// Simple cache for frequently accessed data
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

const getCacheKey = (url, params) => {
    return `${url}?${JSON.stringify(params)}`;
};

const setCache = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

const getCache = (key) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

/**
 * REQ-9, 10, 11: Get translations with pagination and filtering.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @param {object} filters - An object containing filter criteria (e.g., { key, language, projectId }).
 * @returns {Promise} - The axios promise for the request.
 */
const getTranslations = async (page = 1, limit = 10, filters = {}) => {
    const params = {
        page,
        limit,
        ...filters
    };

    const cacheKey = getCacheKey('/translations', params);
    const cached = getCache(cacheKey);
    if (cached) {
        return { data: cached };
    }

    try {
        const response = await API.get('/translations', { params });
        setCache(cacheKey, response.data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * REQ-8: Add a new translation.
 * @param {object} translationData - The data for the new translation.
 * @returns {Promise} - The axios promise for the request.
 */
const addTranslation = async (translationData) => {
    // Clear cache when adding new translations
    cache.clear();
    return API.post('/translations', translationData);
};

/**
 * REQ-8: Update an existing translation.
 * @param {string} id - The ID of the translation to update.
 * @param {object} updatedData - The new data for the translation.
 * @returns {Promise} - The axios promise for the request.
 */
const updateTranslation = async (id, updatedData) => {
    // Clear cache when updating translations
    cache.clear();
    return API.put(`/translations/${id}`, updatedData);
};

/**
 * REQ-12: Delete a translation.
 * @param {string} id - The ID of the translation to delete.
 * @returns {Promise} - The axios promise for the request.
 */
const deleteTranslation = async (id) => {
    // Clear cache when deleting translations
    cache.clear();
    return API.delete(`/translations/${id}`);
};

/**
 * Add multiple translations at once (bulk creation)
 * @param {Array} translationsArray - Array of translation objects to create
 * @returns {Promise} - The axios promise for the request.
 */
const addBulkTranslations = async (translationsArray) => {
    // Clear cache when adding new translations
    cache.clear();
    return API.post('/translations/bulk', { translations: translationsArray });
};

/**
 * Import translations from CSV keys
 * Creates empty translation entries for each key-language combination
 * @param {Array} csvKeys - Array of translation keys from CSV
 * @param {string} projectId - The project ID to associate translations with
 * @param {Array} languages - Array of language codes to create translations for
 * @returns {Promise} - The axios promise for the request with creation stats
 */
const importTranslationsFromCSV = async (csvKeys, projectId, languages) => {
    // Clear cache when importing translations
    cache.clear();
    
    try {
        const response = await API.post('/translations/import-csv', {
            keys: csvKeys,
            projectId: projectId,
            languages: languages
        });
        return response;
    } catch (error) {
        console.error('Error importing CSV translations:', error);
        throw error;
    }
};

/**
 * Create translation entries from CSV keys (alternative method)
 * This method creates the translation objects locally and then uses bulk creation
 * @param {Array} csvKeys - Array of translation keys from CSV
 * @param {string} projectId - The project ID to associate translations with
 * @param {Array} languages - Array of language codes to create translations for
 * @returns {Promise} - Object with creation statistics
 */
const createTranslationsFromCSVKeys = async (csvKeys, projectId, languages) => {
    if (!csvKeys || csvKeys.length === 0 || !languages || languages.length === 0) {
        return { created: 0, skipped: 0 };
    }

    // Create translation objects for each key-language combination
    const translationsToCreate = [];
    
    csvKeys.forEach(key => {
        languages.forEach(languageCode => {
            translationsToCreate.push({
                translationKey: key.trim(),
                language: languageCode.toLowerCase(),
                translatedText: '', // Empty for CSV imports - to be filled later
                status: 'pending', // Default status for new entries
                projectId: projectId,
                importedFromCSV: true, // Flag to identify CSV imports
                dateCreated: new Date().toISOString()
            });
        });
    });

    try {
        // Use bulk creation endpoint
        const response = await addBulkTranslations(translationsToCreate);
        
        // Return statistics about the import
        return {
            created: translationsToCreate.length,
            skipped: 0,
            totalKeys: csvKeys.length,
            totalLanguages: languages.length,
            data: response.data
        };
    } catch (error) {
        console.error('Error creating translations from CSV keys:', error);
        
        // If bulk creation fails, try individual creation (fallback)
        let created = 0;
        let skipped = 0;
        
        for (const translationData of translationsToCreate) {
            try {
                await addTranslation(translationData);
                created++;
            } catch (individualError) {
                console.warn('Skipped translation creation:', individualError.message);
                skipped++;
            }
        }
        
        return { created, skipped, error: error.message };
    }
};

/**
 * Get translation statistics for a project
 * @param {string} projectId - The project ID
 * @returns {Promise} - Translation statistics
 */
const getTranslationStats = async (projectId) => {
    const cacheKey = getCacheKey('/translations/stats', { projectId });
    const cached = getCache(cacheKey);
    if (cached) {
        return { data: cached };
    }
    
    try {
        const response = await API.get(`/translations/stats/${projectId}`);
        setCache(cacheKey, response.data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get pending translations (empty translations from CSV imports)
 * @param {string} projectId - The project ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Pending translations
 */
const getPendingTranslations = async (projectId, page = 1, limit = 10) => {
    const params = {
        page,
        limit,
        projectId,
        status: 'pending',
        emptyTranslations: true // Filter for empty translated text
    };
    
    const cacheKey = getCacheKey('/translations/pending', params);
    const cached = getCache(cacheKey);
    if (cached) {
        return { data: cached };
    }
    
    try {
        const response = await API.get('/translations', { params });
        setCache(cacheKey, response.data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update multiple translations at once
 * @param {Array} updates - Array of {id, updatedData} objects
 * @returns {Promise} - The axios promise for the request
 */
const updateMultipleTranslations = async (updates) => {
    cache.clear();
    return API.patch('/translations/bulk-update', { updates });
};

const translationService = {
    getTranslations,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    addBulkTranslations,
    importTranslationsFromCSV,
    createTranslationsFromCSVKeys,
    getTranslationStats,
    getPendingTranslations,
    updateMultipleTranslations,
};

export default translationService;