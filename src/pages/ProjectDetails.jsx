import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import FuzzySearchInput from '../components/reusableComponents/FuzzySearchInput';

// Import components
import ProjectCard from '../components/ProjectLanguageComponents/ProjectCard';
import Modal from '../components/reusableComponents/Modal';
import AddProject from '../components/ProjectLanguageComponents/AddProject';
import EditProjectForm from '../components/ProjectLanguageComponents/EditProjectForm';
import DeleteProjectModal from '../components/ProjectLanguageComponents/DeleteProjectModal';

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Projects</h2>
          <p className="text-gray-600">Getting your project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Navigation */}
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Go Back"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Project Details</h1>
                <p className="text-gray-600 mt-1">Manage and organize your translation projects</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-center">
                  <div className="text-xl font-semibold text-blue-800">{stats.total}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg border border-teal-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-center">
                  <div className="text-xl font-semibold text-teal-800">{stats.withLanguages}</div>
                  <div className="text-xs text-teal-600">Active</div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-center">
                  <div className="text-xl font-semibold text-amber-800">{stats.withoutLanguages}</div>
                  <div className="text-xs text-amber-600">Pending</div>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 hover:shadow-md transition-shadow duration-200">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800">{stats.filtered}</div>
                  <div className="text-xs text-gray-600">Showing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1 lg:max-w-2xl">
              {/* Search */}
              <div className="relative flex-1">
                <FuzzySearchInput
                  placeholder="Search projects..."
                  searchType="project"
                  onQueryChange={(value) => setSearchTerm(value)}
                  onResultSelect={(result) => {
                    // When a fuzzy search result is selected, set the search term to the project name
                    setSearchTerm(result.displayValue || result.product || result.matchedField);
                  }}
                  className="w-full"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="most-languages">Most Languages</option>
              </select>

              {/* Filter Dropdown */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="all">All Projects</option>
                <option value="with-languages">With Languages</option>
                <option value="without-languages">Without Languages</option>
              </select>
            </div>

            {/* Add Project Button */}
            <button
              onClick={handleAddProject}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Project</span>
              </span>
            </button>
          </div>

          {/* Active filters indicator */}
          {(searchTerm || filterBy !== 'all' || sortBy !== 'newest') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterBy !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    Filter: {filterBy.replace('-', ' ')}
                    <button
                      onClick={() => setFilterBy('all')}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {sortBy !== 'newest' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Sort: {sortBy.replace('-', ' ')}
                    <button
                      onClick={() => setSortBy('newest')}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div>
          {isLoadingProjects ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin border-t-indigo-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProjects.map((project) => (
                <div key={project._id} className="hover:shadow-md transition-shadow duration-200">
                  <ProjectCard
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    bgColor="bg-white"
                    borderColor="border-gray-200"
                    textColor="text-gray-800"
                    editButtonColor="bg-indigo-600"
                    editButtonHoverColor="hover:bg-indigo-700"
                    deleteButtonColor="bg-red-600"
                    deleteButtonHoverColor="hover:bg-red-700"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {searchTerm || filterBy !== 'all' ? 'No projects match your criteria' : 'No projects yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'Get started by creating your first translation project!'
                  }
                </p>
                {(!searchTerm && filterBy === 'all') && (
                  <button 
                    onClick={handleAddProject}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              }`}></div>
              <span className="font-medium break-words">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;