import API from './axiosInstance';

/**
 * Get all projects
 */
const getAllProjects = () => {
    return API.get('/projects');
};

/**
 * Get a single project by ID
 */
const getProjectById = (id) => {
    return API.get(`/projects/${id}`);
};

/**
 * Create a new project
 */
const createProject = (projectData) => {
    return API.post('/projects', projectData);
};

/**
 * Update a project
 */
const updateProject = (id, projectData) => {
    return API.put(`/projects/${id}`, projectData);
};

/**
 * Delete a project
 */
const deleteProject = (id) => {
    return API.delete(`/projects/${id}`);
};

/**
 * Get languages assigned to a project
 */
const getProjectLanguages = (projectId) => {
    return API.get(`/projects/${projectId}/languages`);
};

/**
 * Assign languages to a project
 */
const assignLanguagesToProject = (projectId, languages) => {
    return API.post(`/projects/${projectId}/languages`, { languages });
};

const projectService = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectLanguages,
    assignLanguagesToProject,
};

export default projectService;
