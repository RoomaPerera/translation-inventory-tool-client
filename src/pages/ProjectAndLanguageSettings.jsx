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

const ProjectAndLanguageSettings = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddLanguageForm, setShowAddLanguageForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const { user } = useAuthContext();

  // Fetch data functions
  const fetchLanguages = async () => {
    setIsLoadingLanguages(true);
    try {
      const languagesData = await languageService.getLanguages();
      setLanguages(languagesData);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      alert(`Failed to fetch languages: ${error.message || 'Unknown error'}`);
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
      alert(`Failed to fetch projects: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchLanguages();
    fetchProjects();
  }, []);

  // Event handlers
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(projects.filter(project => project._id !== projectId));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };
  
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAddLanguageForm(false);
  };

  const handleAddProject = () => {
    setShowAddForm(true);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
    setSelectedProject(null);
  };

  const handleAddLanguage = () => {
    setShowAddLanguageForm(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setShowAddLanguageForm(false);
    setShowEditForm(false);
    setSelectedProject(null);
  };

  const getModalTitle = () => {
    if (showAddForm) return 'Add New Project';
    if (showEditForm) return 'Edit Project';
    if (showAddLanguageForm) return 'Add New Language';
    return '';
  };

  const renderModalContent = () => {
    if (showAddForm) {
      return (
        <AddProject 
          onSuccess={async () => {
            closeModal();
            await fetchProjects();
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
          }}
          existingLanguages={languages}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-full">
      <div className="transition-all duration-300">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'projects' && (
          <ProjectManagement
            projects={projects}
            isLoadingProjects={isLoadingProjects}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
        
        {activeTab === 'languages' && (
          <LanguageManagement
            languages={languages}
            isLoadingLanguages={isLoadingLanguages}
            onAddLanguage={handleAddLanguage}
          />
        )}
        
        {activeTab === 'quick-actions' && (
          <QuickActions setActiveTab={setActiveTab} />
        )}
      </div>
      
      <Modal
        isOpen={showAddForm || showAddLanguageForm || showEditForm}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ProjectAndLanguageSettings;