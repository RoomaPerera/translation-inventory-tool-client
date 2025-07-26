import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import projectService from '../services/projectService';
import languageService from '../services/languageService';

// Import reusable components
import TabNavigation from '../components/reusableComponents/TabNavigation';
import ProjectManagement from '../components/ProjectLanguageComponents/ProjectManagement';
import LanguageManagement from '../components/ProjectLanguageComponents/LanguageManagement';
import QuickActions from '../components/ProjectLanguageComponents/QuickActions';
import Modal from '../components/reusableComponents/Modal';

// Import forms
import AddProject from '../components/ProjectLanguageComponents/AddProject';
import EditProjectForm from '../components/ProjectLanguageComponents/EditProjectForm';
import LanguageForm from '../components/ProjectLanguageComponents/LanguageForm';
import DeleteProjectModal from '../components/ProjectLanguageComponents/DeleteProjectModal';

const ProjectAndLanguageSettings = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddLanguageForm, setShowAddLanguageForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const { user } = useAuthContext();

  // Enhanced stats calculations
  const stats = {
    totalProjects: projects.length,
    totalLanguages: languages.length,
    projectsWithLanguages: projects.filter(p => p.languages?.length > 0).length,
    averageLanguagesPerProject: projects.length > 0 
      ? (projects.reduce((sum, p) => sum + (p.languages?.length || 0), 0) / projects.length).toFixed(1)
      : 0
  };

  // Fetch data functions
  const fetchLanguages = async () => {
    setIsLoadingLanguages(true);
    try {
      const languagesData = await languageService.getLanguages();
      setLanguages(languagesData);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      showNotification('Failed to fetch languages: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsLoadingLanguages(false);
    }
  };
  
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showNotification('Failed to fetch projects: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Enhanced notification system
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await Promise.all([fetchLanguages(), fetchProjects()]);
      setIsPageLoading(false);
      setTimeout(() => setShowStats(true), 500);
    };
    loadData();
  }, []);

  // Enhanced event handlers with notifications
  const handleDeleteProject = (projectOrId) => {
    console.log('handleDeleteProject called with:', projectOrId); // Debug log
    
    // Handle both cases: full project object or just ID
    let project;
    if (typeof projectOrId === 'string') {
      // If it's just an ID, find the full project
      project = projects.find(p => p._id === projectOrId);
    } else {
      // If it's already a project object
      project = projectOrId;
    }
    
    console.log('Final project object:', project); // Debug log
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
  };

  const handleConfirmDelete = (projectId) => {
    setProjects(projects.filter(project => project._id !== projectId));
    setShowDeleteModal(false);
    setProjectToDelete(null);
    showNotification('✅ Project deleted successfully!', 'success');
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

// Enhanced handleDeleteLanguage function with default language protection
const handleDeleteLanguage = async (language) => {
  try {
    console.log('Deleting language:', language);
    
    // Get the language ID (handle both _id and id)
    const languageId = language._id || language.id;
    const languageCode = language.code;
    const languageName = language.name || language.code;
    
    if (!languageId) {
      throw new Error('Language ID is missing');
    }
    
    // Step 1: Check if this language is used as default language in any project
    const projectsUsingAsDefault = projects.filter(project => {
      if (!project.defaultLanguage) return false;
      
      // Handle both string and object formats for defaultLanguage
      if (typeof project.defaultLanguage === 'string') {
        return project.defaultLanguage === languageCode;
      } else if (typeof project.defaultLanguage === 'object') {
        return project.defaultLanguage.code === languageCode || 
               (project.defaultLanguage._id || project.defaultLanguage.id) === languageId;
      }
      return false;
    });
    
    // If language is used as default, prevent deletion and show warning
    if (projectsUsingAsDefault.length > 0) {
      const projectNames = projectsUsingAsDefault.map(p => p.name).join(', ');
      const projectWord = projectsUsingAsDefault.length === 1 ? 'project' : 'projects';
      
      showNotification(
        `❌ Cannot delete language "${languageName}". It is set as the default language for ${projectsUsingAsDefault.length} ${projectWord}: ${projectNames}. Please change the default language for these projects first.`,
        'error'
      );
      
      // Throw error to stop the deletion process
      throw new Error(`Language is used as default language in ${projectsUsingAsDefault.length} project(s)`);
    }
    
    // Step 2: Delete the language from the database
    console.log(`Calling languageService.deleteLanguage with ID: ${languageId}`);
    await languageService.deleteLanguage(languageId);
    console.log('Language deleted from database successfully');
    
    // Step 3: Remove the language from local state
    setLanguages(prev => {
      const filtered = prev.filter(lang => 
        (lang._id || lang.id) !== languageId
      );
      console.log(`Removed language from state. Before: ${prev.length}, After: ${filtered.length}`);
      return filtered;
    });
    
    // Step 4: Update all projects that use this language (but not as default)
    const updatedProjects = [];
    const projectsToUpdate = projects.filter(project => {
      if (!project.languages || project.languages.length === 0) return false;
      
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
        
        // Remove the language from the project's languages array
        const updatedLanguages = project.languages.filter(lang => {
          if (typeof lang === 'string') {
            return lang !== languageCode;
          } else if (typeof lang === 'object') {
            return lang.code !== languageCode && (lang._id || lang.id) !== languageId;
          }
          return true;
        });
        
        console.log(`Project ${project.name}: Languages before: ${project.languages.length}, after: ${updatedLanguages.length}`);
        
        // Update the project in the database
        const updatedProject = await projectService.updateProject(project._id, {
          ...project,
          languages: updatedLanguages
        });
        
        updatedProjects.push(updatedProject);
        console.log(`Successfully updated project: ${project.name}`);
        
      } catch (projectError) {
        console.error(`Failed to update project ${project.name}:`, projectError);
        // Extract error message from your service's error structure
        const errorMessage = projectError.message || 
          (projectError.response?.data?.message) || 
          'Unknown error';
        showNotification(`Warning: Failed to remove language from project "${project.name}": ${errorMessage}`, 'error');
      }
    }
    
    // Step 5: Update the projects state with the modified projects
    if (updatedProjects.length > 0) {
      setProjects(prev => prev.map(project => {
        const updatedProject = updatedProjects.find(up => up._id === project._id);
        return updatedProject || project;
      }));
      
      showNotification(
        `🗑️ Language "${languageName}" deleted and removed from ${updatedProjects.length} project(s)!`, 
        'success'
      );
    } else {
      showNotification(`🗑️ Language "${languageName}" deleted successfully!`, 'success');
    }
    
  } catch (error) {
    console.error('Failed to delete language:', error);
    
    // Don't show duplicate error messages for default language protection
    if (!error.message?.includes('used as default language')) {
      // Extract error message from your service's error structure
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
    
    throw error; // Re-throw to let the LanguageManagement component handle it
  }
};

  const closeModal = () => {
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
    setShowDeleteModal(false);
    setSelectedProject(null);
    setProjectToDelete(null);
  };

  const getModalTitle = () => {
    if (showAddForm) return 'Add New Project';
    if (showEditForm) return 'Edit Project';
    if (showAddLanguageForm) return 'Add New Language';
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
          availableLanguages={languages}
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
          availableLanguages={languages}
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
          existingLanguages={languages}
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
    // Add subtle vibration feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-indigo-400"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Loading Dashboard</h2>
            <p className="text-slate-600">Preparing your workspace...</p>
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
      {/* Enhanced Responsive Header Section */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
            {/* Title Section - Mobile First */}
            <div className="space-y-1 mb-4 lg:mb-0">
              {/* <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-700 animate-gradient">
                <span className="hidden sm:inline">🚀 </span>Project & Language Settings
              </h1> */}
              <p className="text-slate-600/80 text-xs sm:text-sm">
                Manage your projects and languages with ease
              </p>
            </div>
            
            {/* Quick Stats Dashboard - Responsive */}
            <div className={`transition-all duration-700 transform ${
              showStats ? 'translate-x-0 opacity-100' : 'translate-x-4 lg:translate-x-8 opacity-0'
            }`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800">{stats.totalProjects}</div>
                    <div className="text-xs text-blue-600">Projects</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-800">{stats.totalLanguages}</div>
                    <div className="text-xs text-indigo-600">Languages</div>
                  </div>
                </div>
                {/* Additional stats for larger screens */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-teal-200 hover:shadow-lg transition-all duration-300 hover:scale-105 sm:block lg:hidden">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-teal-800">{stats.projectsWithLanguages}</div>
                    <div className="text-xs text-teal-600">Active</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-300 hover:shadow-lg transition-all duration-300 hover:scale-105 sm:block lg:hidden">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-slate-800">{stats.averageLanguagesPerProject}</div>
                    <div className="text-xs text-slate-600">Avg/Project</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Tab Navigation - Mobile Optimized */}
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
          {activeTab === 'projects' && (
            <div className="animate-fade-in">
              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-blue-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <h2 className="text-lg sm:text-xl font-semibold text-blue-800">Project Management</h2>
                </div>
                <p className="text-blue-600/80 text-sm">
                  Create, edit, and manage your translation projects
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <ProjectManagement
                  projects={projects}
                  isLoadingProjects={isLoadingProjects}
                  onAddProject={handleAddProject}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                />
              </div>
            </div>
          )}
          
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
                  languages={languages}
                  isLoadingLanguages={isLoadingLanguages}
                  onAddLanguage={handleAddLanguage}
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
        isOpen={showAddForm || showAddLanguageForm || showEditForm || showDeleteModal}
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