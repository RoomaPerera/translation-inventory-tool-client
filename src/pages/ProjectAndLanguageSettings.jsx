import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import languageService from '../services/languageService';

// Import reusable components
import TabNavigation from '../components/reusableComponents/TabNavigation';
import LanguageManagement from '../components/ProjectLanguageComponents/LanguageManagement';
import QuickActions from '../components/ProjectLanguageComponents/QuickActions';
import Modal from '../components/reusableComponents/Modal';

// Import forms
import AddProject from '../components/ProjectLanguageComponents/AddProject';
import EditProjectForm from '../components/ProjectLanguageComponents/EditProjectForm';
import LanguageForm from '../components/ProjectLanguageComponents/LanguageForm';
import DeleteProjectModal from '../components/ProjectLanguageComponents/DeleteProjectModal';
import EditLanguageForm from '../components/ProjectLanguageComponents/EditLanguageModal';

const ProjectAndLanguageSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddLanguageForm, setShowAddLanguageForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // FIXED: Always initialize as arrays to prevent filter errors
  const [projects, setProjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useAuthContext();
  const [showEditLanguageForm, setShowEditLanguageForm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // FIXED: Enhanced stats calculations with array safety checks
  const stats = {
    totalProjects: Array.isArray(projects) ? projects.length : 0,
    totalLanguages: Array.isArray(languages) ? languages.length : 0,
    projectsWithLanguages: Array.isArray(projects) 
      ? projects.filter(p => Array.isArray(p.languages) && p.languages.length > 0).length 
      : 0,
    averageLanguagesPerProject: Array.isArray(projects) && projects.length > 0 
      ? (projects.reduce((sum, p) => sum + (Array.isArray(p.languages) ? p.languages.length : 0), 0) / projects.length).toFixed(1)
      : 0
  };

  // FIXED: Enhanced fetch functions with proper error handling
  const fetchLanguages = async () => {
    setIsLoadingLanguages(true);
    try {
      console.log('Fetching languages...');
      const languagesData = await languageService.getLanguages();
      console.log('Languages response:', languagesData);
      
      // Ensure we always set an array
      if (Array.isArray(languagesData)) {
        setLanguages(languagesData);
      } else if (languagesData && Array.isArray(languagesData.data)) {
        setLanguages(languagesData.data);
      } else {
        console.warn('Languages response is not an array:', languagesData);
        setLanguages([]);
        showNotification('Unexpected response format for languages', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setLanguages([]); // Ensure array on error
      showNotification('Failed to fetch languages: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsLoadingLanguages(false);
    }
  };
  
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      console.log('Fetching projects...');
      const projectsData = await projectService.getProjects();
      console.log('Projects response:', projectsData);
      
      // Ensure we always set an array
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else if (projectsData && Array.isArray(projectsData.data)) {
        setProjects(projectsData.data);
      } else {
        console.warn('Projects response is not an array:', projectsData);
        setProjects([]);
        showNotification('Unexpected response format for projects', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]); // Ensure array on error
      showNotification('Failed to fetch projects: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Notification system
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // FIXED: Enhanced effects with better error handling
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsPageLoading(false);
        return;
      }

      setIsPageLoading(true);
      try {
        await Promise.all([fetchLanguages(), fetchProjects()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Failed to load initial data. Please refresh the page.', 'error');
      } finally {
        setIsPageLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Enhanced event handlers with notifications
  const handleDeleteProject = (projectOrId) => {
    console.log('handleDeleteProject called with:', projectOrId);
    
    // Ensure projects is an array before searching
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array when trying to delete:', projects);
      showNotification('Cannot delete project: data error', 'error');
      return;
    }
    
    let project;
    if (typeof projectOrId === 'string') {
      project = projects.find(p => p._id === projectOrId);
    } else {
      project = projectOrId;
    }
    
    console.log('Final project object:', project);
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
  };

  const handleConfirmDelete = (projectId) => {
    // Ensure projects is an array before filtering
    if (Array.isArray(projects)) {
      setProjects(projects.filter(project => project._id !== projectId));
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
    showNotification('Project deleted successfully!', 'success');
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };
  
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowDeleteModal(false);
  };

  const handleAddProject = () => {
    setShowAddForm(true);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleAddLanguage = () => {
    setShowAddLanguageForm(true);
    setShowAddForm(false);
    setShowEditForm(false);
    setShowDeleteModal(false);
  };

  // Navigate to project details page
  const handleViewProjectDetails = () => {
    navigate('/project-details');
  };

  // FIXED: Enhanced handleDeleteLanguage function with array safety checks
  const handleDeleteLanguage = async (language) => {
    try {
      console.log('Deleting language:', language);
      
      const languageId = language._id || language.id;
      const languageCode = language.code;
      const languageName = language.name || language.code;
      
      if (!languageId) {
        throw new Error('Language ID is missing');
      }
      
      // Ensure projects is an array before filtering
      const safeProjects = Array.isArray(projects) ? projects : [];
      const projectsUsingAsDefault = safeProjects.filter(project => {
        if (!project.defaultLanguage) return false;
        
        if (typeof project.defaultLanguage === 'string') {
          return project.defaultLanguage === languageCode;
        } else if (typeof project.defaultLanguage === 'object') {
          return project.defaultLanguage.code === languageCode || 
                 (project.defaultLanguage._id || project.defaultLanguage.id) === languageId;
        }
        return false;
      });
      
      if (projectsUsingAsDefault.length > 0) {
        const projectNames = projectsUsingAsDefault.map(p => p.name).join(', ');
        const projectWord = projectsUsingAsDefault.length === 1 ? 'project' : 'projects';
        
        showNotification(
          `❌ Cannot delete language "${languageName}". It is set as the default language for ${projectsUsingAsDefault.length} ${projectWord}: ${projectNames}. Please change the default language for these projects first.`,
          'error'
        );
        
        throw new Error(`Language is used as default language in ${projectsUsingAsDefault.length} project(s)`);
      }
      
      console.log(`Calling languageService.deleteLanguage with ID: ${languageId}`);
      await languageService.deleteLanguage(languageId);
      console.log('Language deleted from database successfully');
      
      setLanguages(prev => {
        const safeArray = Array.isArray(prev) ? prev : [];
        const filtered = safeArray.filter(lang => 
          (lang._id || lang.id) !== languageId
        );
        console.log(`Removed language from state. Before: ${safeArray.length}, After: ${filtered.length}`);
        return filtered;
      });
      
      const updatedProjects = [];
      const projectsToUpdate = safeProjects.filter(project => {
        if (!Array.isArray(project.languages) || project.languages.length === 0) return false;
        
        return project.languages.some(lang => {
          if (typeof lang === 'string') {
            return lang === languageCode;
          } else if (typeof lang === 'object') {
            return lang.code === languageCode || (lang._id || lang.id) === languageId;
          }
          return false;
        });
      });
      
      console.log(`Found ${projectsToUpdate.length} projects using this language`);
      
      for (const project of projectsToUpdate) {
        try {
          console.log(`Updating project: ${project.name} (ID: ${project._id})`);
          
          const updatedLanguages = Array.isArray(project.languages) 
            ? project.languages.filter(lang => {
                if (typeof lang === 'string') {
                  return lang !== languageCode;
                } else if (typeof lang === 'object') {
                  return lang.code !== languageCode && (lang._id || lang.id) !== languageId;
                }
                return true;
              })
            : [];
          
          console.log(`Project ${project.name}: Languages before: ${Array.isArray(project.languages) ? project.languages.length : 0}, after: ${updatedLanguages.length}`);
          
          const updatedProject = await projectService.updateProject(project._id, {
            ...project,
            languages: updatedLanguages
          });
          
          updatedProjects.push(updatedProject);
          console.log(`Successfully updated project: ${project.name}`);
          
        } catch (projectError) {
          console.error(`Failed to update project ${project.name}:`, projectError);
          const errorMessage = projectError.message || 
            (projectError.response?.data?.message) || 
            'Unknown error';
          showNotification(`Warning: Failed to remove language from project "${project.name}": ${errorMessage}`, 'error');
        }
      }
      
      if (updatedProjects.length > 0) {
        setProjects(prev => {
          const safeArray = Array.isArray(prev) ? prev : [];
          return safeArray.map(project => {
            const updatedProject = updatedProjects.find(up => up._id === project._id);
            return updatedProject || project;
          });
        });
        
        showNotification(
          `🗑️ Language "${languageName}" deleted and removed from ${updatedProjects.length} project(s)!`, 
          'success'
        );
      } else {
        showNotification(`🗑️ Language "${languageName}" deleted successfully!`, 'success');
      }
      
    } catch (error) {
      console.error('Failed to delete language:', error);
      
      if (!error.message?.includes('used as default language')) {
        let errorMessage = 'Unknown error occurred';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        showNotification(
          `Failed to delete language: ${errorMessage}`, 
          'error'
        );
      }
      
      throw error;
    }
  };

  const handleEditLanguage = (language) => {
    setSelectedLanguage(language);
    setShowEditLanguageForm(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowDeleteModal(false);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
    setShowEditLanguageForm(false);
    setShowDeleteModal(false);
    setSelectedProject(null);
    setSelectedLanguage(null);
    setProjectToDelete(null);
  };

  const getModalTitle = () => {
    if (showAddForm) return 'Add New Project';
    if (showEditForm) return 'Edit Project';
    if (showAddLanguageForm) return 'Add New Language';
    if (showEditLanguageForm) return 'Edit Language'; 
    if (showDeleteModal) return 'Delete Project';
    return '';
  };

  const renderModalContent = () => {
    if (showAddForm) {
      return (
        <AddProject 
          onSuccess={async () => {
            closeModal();
            await fetchProjects();
            showNotification('Project added successfully!', 'success');
          }} 
          availableLanguages={Array.isArray(languages) ? languages : []}
        />
      );
    }
    
    if (showEditForm && selectedProject) {
      return (
        <EditProjectForm 
          project={selectedProject}
          onSuccess={async () => {
            closeModal();
            await fetchProjects();
            showNotification('Project updated successfully!', 'success');
          }} 
          availableLanguages={Array.isArray(languages) ? languages : []}
        />
      );
    }
    
    if (showAddLanguageForm) {
      return (
        <LanguageForm 
          onSuccess={async () => {
            closeModal();
            await fetchLanguages();
            showNotification('Language added successfully!', 'success');
          }}
          existingLanguages={Array.isArray(languages) ? languages : []}
        />
      );
    }

    if (showEditLanguageForm && selectedLanguage) {
      return (
        <EditLanguageForm 
          language={selectedLanguage}
          onSuccess={async () => {
            closeModal();
            await fetchLanguages();
            await fetchProjects(); // Refresh projects in case language was used in projects
            showNotification('Language updated successfully!', 'success');
          }}
          existingLanguages={Array.isArray(languages) ? languages : []}
        />
      );
    }

    if (showDeleteModal && projectToDelete) {
      return (
        <DeleteProjectModal
          project={projectToDelete}
          onSuccess={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      );
    }
    
    return null;
  };

  // Tab change handler with animation
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Simple Project Overview Component
  const ProjectOverview = () => (
    <div className="animate-fade-in">
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-blue-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
          <h1 className="text-lg sm:text-xl font-semibold text-black-800">Project Overview</h1>
        </div>
        <p className="text-black-600/80 text">
          Manage your translation projects and access detailed project information
        </p>
      </div>
      
      <div className="grid gap-4 sm:gap-6">
        {/* Add Project Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span>Create New Project</span>
              </h3>
              <p className="text-slate-600">Start a new translation project with custom settings</p>
            </div>
            <button
              onClick={handleAddProject}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Project</span>
              </span>
            </button>
          </div>
        </div>

        {/* Your Projects Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                <span>Your Projects</span>
              </h3>
              <p className="text-slate-600">
                View and manage all your projects ({stats.totalProjects} total)
              </p>
              {stats.totalProjects > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">
                    {stats.projectsWithLanguages} Active
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleViewProjectDetails}
              disabled={isLoadingProjects}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{isLoadingProjects ? 'Loading...' : 'View Projects'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats.totalProjects > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl sm:rounded-2xl border border-slate-200/60 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-slate-500 to-blue-500 rounded-full"></div>
              <span>Project Statistics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                <div className="text-sm text-slate-600">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{stats.projectsWithLanguages}</div>
                <div className="text-sm text-slate-600">With Languages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalLanguages}</div>
                <div className="text-sm text-slate-600">Available Languages</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // FIXED: Added user check for early return
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Please log in to access this page</h2>
          <p className="text-slate-600">You need to be logged in to manage projects and languages.</p>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-indigo-400"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Loading</h2>
          </div>
          <div className="flex space-x-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Simplified Responsive Header Section */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Tab Navigation */}
          <div className="relative overflow-x-auto">
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              className="transform transition-all duration-500 min-w-max sm:min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Responsive Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'projects' && <ProjectOverview />}
          
          {activeTab === 'languages' && (
            <div className="animate-fade-in">
              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-indigo-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <h2 className="text-lg sm:text-xl font-semibold text-indigo-800">Language Management</h2>
                </div>
                <p className="text-indigo-600/80 text-sm">
                  Add and configure supported languages for your projects
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <LanguageManagement
                  languages={Array.isArray(languages) ? languages : []}
                  isLoadingLanguages={isLoadingLanguages}
                  onAddLanguage={handleAddLanguage}
                  onEditLanguage={handleEditLanguage}  
                  onDeleteLanguage={handleDeleteLanguage}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'quick-actions' && (
            <div className="animate-fade-in">
              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <h2 className="text-lg sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-700">
                    Quick Actions
                  </h2>
                </div>
                <p className="text-slate-600/80 text-sm">
                  Fast access to common tasks and workflows
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <QuickActions setActiveTab={handleTabChange} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Responsive Modal with backdrop blur */}
      <Modal
        isOpen={showAddForm || showAddLanguageForm || showEditForm || showEditLanguageForm || showDeleteModal}
        onClose={closeModal}
        title={getModalTitle()}
        className="backdrop-blur-xl bg-white/96 mx-4 sm:mx-0 border border-slate-200/50"
      >
        <div className="animate-modal-content">
          {renderModalContent()}
        </div>
      </Modal>

      {/* Enhanced Responsive Notification System */}
      <div className="fixed top-4 right-2 sm:right-4 z-50 space-y-2 max-w-xs sm:max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg border backdrop-blur-lg transform transition-all duration-500 animate-slide-in-right text-sm sm:text-base ${
              notification.type === 'success' 
                ? 'bg-teal-50/95 border-teal-200 text-teal-800' 
                : notification.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                notification.type === 'success' ? 'bg-teal-500' :
                notification.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              }`}></div>
              <span className="font-medium break-words">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @media (max-width: 640px) {
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
        }
        
        @keyframes modal-content {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-modal-content {
          animation: modal-content 0.3s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .animate-fade-in {
            animation: fade-in 0.4s ease-out;
          }
        }
        
        /* Smooth scrolling for tab navigation */
        .overflow-x-auto {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProjectAndLanguageSettings;