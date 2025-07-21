import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import { useAuthContext } from '../hooks/useAuthContext';
import AddProject from '../components/Modals/AddProject';
import EditProjectForm from '../components/Modals/EditProjectForm';
import LanguageForm from '../components/LanguageForm';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('projects'); // Toggle between 'projects', 'languages', and 'quick-actions'
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddLanguageForm, setShowAddLanguageForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const { user } = useAuthContext(); // Get the current user
  const modalRef = useRef(null);

  // Click outside to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddForm(false);
        setShowAddLanguageForm(false);
        setShowEditForm(false);
      }
    }
    
    if (showAddForm || showAddLanguageForm || showEditForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddForm, showAddLanguageForm, showEditForm]);

  // Fetch languages when component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        console.log('Fetching languages...');
        const languagesData = await languageService.getLanguages();
        console.log('Languages fetched successfully:', languagesData);
        setLanguages(languagesData);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Show more detailed error information
        alert(`Failed to fetch languages: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        console.log('Fetching projects...');
        const projectsData = await projectService.getProjects();
        console.log('Projects fetched successfully:', projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        // Show more detailed error information
        alert(`Failed to fetch projects: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Delete project function
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) { //confirmation alert
      try {
        await projectService.deleteProject(projectId);
        // Update projects list after deletion
        setProjects(projects.filter(project => project._id !== projectId));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };
  
  // Edit project function
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showAddForm || showAddLanguageForm || showEditForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddForm, showAddLanguageForm, showEditForm]);

  return (
    <div className="max-w-full">
      <div className="transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">Settings</h1>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
              activeTab === 'projects'
                ? 'text-indigo-700 border-indigo-700 bg-white'
                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            Project Management
          </button>
          <button
            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
              activeTab === 'languages'
                ? 'text-indigo-700 border-indigo-700 bg-white'
                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('languages')}
          >
            Language Management
          </button>
          <button
            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
              activeTab === 'quick-actions'
                ? 'text-indigo-700 border-indigo-700 bg-white'
                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('quick-actions')}
          >
            Quick Actions
          </button>
        </div>
        
        {/* Project Management Section */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Project Management</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Manage your translation projects from here. Add new projects, view existing ones, 
                and keep track of all your projects.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <button 
                  onClick={() => {
                    setShowAddForm(true);
                    setShowAddLanguageForm(false);
                    setShowEditForm(false);
                    setSelectedProject(null);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Project
                </button>
              </div>
              
              {/* Projects List */}
              <div>
                <h3 className="text-lg font-medium mb-3">Your Projects</h3>
                {isLoadingProjects ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Languages
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => (
                          <tr key={project._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{project.name}</div>
                              {project.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {project.languages && project.languages.map((lang, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {lang}
                                  </span>
                                ))}
                                {(!project.languages || project.languages.length === 0) && (
                                  <span className="text-gray-500 text-sm italic">No languages</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-gray-500">No projects yet. Create your first project!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Language Management Section */}
        {activeTab === 'languages' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Language Management</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Add new languages that can be assigned to projects and translators.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    setShowAddLanguageForm(true);
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  
                  Add New Language
                </button>
              </div>
              
              {/* Display existing languages */}
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Available Languages</h3>
                {isLoadingLanguages ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                ) : languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languages.map((language) => (
                      <div 
                        key={language._id} 
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md flex items-center"
                      >
                        <span className="font-medium">{language.code}</span>
                        {language.name && <span className="ml-1 text-sm">- {language.name}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No languages available. Add your first language.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions Section */}
        {activeTab === 'quick-actions' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Access advanced features and management tools for your translation system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* REQ-18: Translator Management */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-purple-800">User Management</h3>
                  </div>
                  <p className="text-purple-700 mb-4 text-sm">
                    Manage translators and assign languages to users. View user lists and approve pending registrations.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">REQ-18</span>
                    <Link 
                      to="/translator-management"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                    >
                      Open
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* REQ-19: Translation Files */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-800">Translation Files</h3>
                  </div>
                  <p className="text-green-700 mb-4 text-sm">
                    Generate and download translation files for developers. Access project-specific translation data.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">REQ-19</span>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Select Project
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* REQ-20: File Upload */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h3 className="text-lg font-semibold text-blue-800">File Upload</h3>
                  </div>
                  <p className="text-blue-700 mb-4 text-sm">
                    Upload translation files to update existing translations with value replacement support.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">REQ-20</span>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Project
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* REQ-21: Translation Contexts */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-yellow-800">Translation Contexts</h3>
                  </div>
                  <p className="text-yellow-700 mb-4 text-sm">
                    Manage translation variations based on different contexts. View contextual translations.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">REQ-21</span>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                    >
                      View Contexts
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">System Settings</h3>
                  </div>
                  <p className="text-gray-700 mb-4 text-sm">
                    Configure system-wide settings and preferences for the translation inventory tool.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">Admin</span>
                    <button
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      disabled
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>

                {/* API Documentation */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-indigo-800">API Documentation</h3>
                  </div>
                  <p className="text-indigo-700 mb-4 text-sm">
                    Access API documentation and developer resources for integration.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-medium">Developer</span>
                    <a
                      href="http://localhost:5000/api/test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Test API
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      
      {(showAddForm || showAddLanguageForm || showEditForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-white bg-opacity-70">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-modal-appear"
            style={{ maxHeight: '90vh', overflow: 'auto' }}
          >
            {/* Modal Header */}
            <div className="bg-indigo-600 p-4 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {showAddForm 
                    ? 'Add New Project' 
                    : showEditForm 
                      ? 'Edit Project' 
                      : 'Add New Language'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setShowAddLanguageForm(false);
                    setShowEditForm(false);
                    setSelectedProject(null);
                  }}
                  className="text-white hover:text-indigo-100 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {showAddForm && (
                <AddProject 
                  onSuccess={() => {
                    setShowAddForm(false);
                    // Refresh projects list
                    projectService.getProjects().then(data => setProjects(data));
                  }} 
                  availableLanguages={languages}
                />
              )}
              
              {showEditForm && selectedProject && (
                <EditProjectForm 
                  project={selectedProject}
                  onSuccess={() => {
                    setShowEditForm(false);
                    setSelectedProject(null);
                    // Refresh projects list
                    projectService.getProjects().then(data => setProjects(data));
                  }} 
                  availableLanguages={languages}
                />
              )}
              
              {showAddLanguageForm && (
                <LanguageForm 
                  onSuccess={() => {
                    setShowAddLanguageForm(false);
                    // Refresh languages list
                    languageService.getLanguages().then(data => setLanguages(data));
                  }}
                  existingLanguages={languages}
                />
              )}
            </div>
          </div>
        </div>
        
      )}
      
      {/* Add animation keyframes for modal */}
      <style jsx>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modalAppear 0.3s ease-out forwards;
        }
      `}</style>
      
    </div>
    
  );
};

export default Settings;