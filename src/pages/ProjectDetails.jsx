
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import Modal from '../components/reusableComponents/Modal';
import AddProject from '../components/ProjectLanguageComponents/AddProject';
import EditProjectForm from '../components/ProjectLanguageComponents/EditProjectForm';
import DeleteProjectModal from '../components/ProjectLanguageComponents/DeleteProjectModal';
// New split components
import ProjectDetailsHeader from '../components/ProjectDetails/ProjectDetailsHeader';
import ProjectActionBar from '../components/ProjectDetails/ProjectActionBar';
import ProjectGrid from '../components/ProjectDetails/ProjectGrid';
import Notifications from '../components/ProjectDetails/Notifications';
import LoadingScreen from '../components/ProjectDetails/LoadingScreen';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Notification system
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuthContext();

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Fetch functions
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showNotification('Failed to fetch projects: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await Promise.all([fetchProjects(), fetchLanguages()]);
      setIsPageLoading(false);
    };
    loadData();
  }, []);

  // Filter and sort projects
  const getFilteredAndSortedProjects = () => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'with-languages') return matchesSearch && project.languages?.length > 0;
      if (filterBy === 'without-languages') return matchesSearch && (!project.languages || project.languages.length === 0);
      
      return matchesSearch;
    });

    // Sort projects
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'most-languages':
        return filtered.sort((a, b) => (b.languages?.length || 0) - (a.languages?.length || 0));
      default:
        return filtered;
    }
  };

  const filteredProjects = getFilteredAndSortedProjects();

  // Stats
  const stats = {
    total: projects.length,
    withLanguages: projects.filter(p => p.languages?.length > 0).length,
    withoutLanguages: projects.filter(p => !p.languages || p.languages.length === 0).length,
    filtered: filteredProjects.length
  };

  // Event handlers
  const handleAddProject = () => {
    setShowAddForm(true);
    setShowEditForm(false);
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowDeleteModal(false);
  };

  const handleDeleteProject = (projectOrId) => {
    let project;
    if (typeof projectOrId === 'string') {
      project = projects.find(p => p._id === projectOrId);
    } else {
      project = projectOrId;
    }
    
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const handleConfirmDelete = (projectId) => {
    setProjects(projects.filter(project => project._id !== projectId));
    setShowDeleteModal(false);
    setProjectToDelete(null);
    showNotification('Project deleted successfully!', 'success');
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowDeleteModal(false);
    setSelectedProject(null);
    setProjectToDelete(null);
  };

  const getModalTitle = () => {
    if (showAddForm) return 'Add New Project';
    if (showEditForm) return 'Edit Project';
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

  if (isPageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProjectDetailsHeader navigate={navigate} stats={stats} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProjectActionBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          handleAddProject={handleAddProject}
        />
        {/* Projects Grid */}
        <ProjectGrid
          isLoadingProjects={isLoadingProjects}
          filteredProjects={filteredProjects}
          handleEditProject={handleEditProject}
          handleDeleteProject={handleDeleteProject}
          searchTerm={searchTerm}
          filterBy={filterBy}
          handleAddProject={handleAddProject}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={showAddForm || showEditForm || showDeleteModal}
        onClose={closeModal}
        title={getModalTitle()}
        className="bg-white mx-4 sm:mx-0 border border-gray-200"
      >
        <div>
          {renderModalContent()}
        </div>
      </Modal>

      {/* Notifications */}
      <Notifications notifications={notifications} />
    </div>
  );
};

export default ProjectDetails;