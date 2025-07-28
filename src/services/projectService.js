import API from './axiosInstance';

// 🔹 Get all projects
const getAllProjects = () => API.get('/projects');

// 🔹 Get project by ID
const getProjectById = (id) => API.get(`/projects/${id}`);

// 🔹 Create new project
const createProject = (projectData) => API.post('/projects', projectData);

// 🔹 Update project
const updateProject = (id, projectData) => API.put(`/projects/${id}`, projectData);

// 🔹 Delete project
const deleteProject = (id) => API.delete(`/projects/${id}`);

// 🔹 Assign multiple languages to a project
const assignLanguagesToProject = (projectId, languages) => 
  API.post(`/projects/${projectId}/languages`, { languages });

// 🔹 Get languages assigned to a project
const getProjectLanguages = (projectId) => 
  API.get(`/projects/${projectId}/languages`);

// 🔹 Set default language for a project
const setProjectDefaultLanguage = (projectId, languageId) => 
  API.put(`/projects/${projectId}/default-language`, { languageId });

// 🔹 Get default language for a project
const getProjectDefaultLanguage = (projectId) => 
  API.get(`/projects/${projectId}/default-language`);

// 🔹 Remove default language from a project
const removeProjectDefaultLanguage = (projectId) => 
  API.delete(`/projects/${projectId}/default-language`);

// 🔹 Test API connection
const testConnection = () => API.get('/test');

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignLanguagesToProject,
  getProjectLanguages,
  setProjectDefaultLanguage,
  getProjectDefaultLanguage,
  removeProjectDefaultLanguage,
  testConnection,
};

export default projectService;

