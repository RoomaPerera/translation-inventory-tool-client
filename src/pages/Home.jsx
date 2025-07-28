import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

// Import utilities
import { showToast, handleApiError } from '../utils/notifications';
import useDebounce from '../hooks/useDebounce';

// Import components - UNIFIED APPROACH
import HomeHeader from '../components/home/HomeHeader';
import HomeToolbar from '../components/home/HomeToolbar';
import TranslationTable from '../components/TranslationTable';
import AddLanguageModal from '../components/ProjectLanguageComponents/AssignLanguageModal';
import AddTranslationModal from '../components/AddTranslationModal';
import EditTranslationModal from '../components/EditTranslationModal';
import AssignLanguageModal from '../components/ProjectLanguageComponents/AssignLanguageModal';
import { Pagination } from '../components/reusableComponents/Pagination';
import ConfirmModal from '../components/UserListComponents/ConfirmModal';

// Import services
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import translationService from '../services/translationService';
import API from '../services/axiosInstance';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // 🔥 UNIFIED STATE MANAGEMENT
  // Modal states
  const [isAddLanguageModalOpen, setAddLanguageModalOpen] = useState(false);
  const [isAddTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
  const [isEditTranslationModalOpen, setEditTranslationModalOpen] = useState(false);
  const [isAssignLangModalOpen, setAssignLangModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Data states - COMBINED from both approaches
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allLanguages, setAllLanguages] = useState([]);
  const [projectLanguages, setProjectLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states - UNIFIED approach
  const [filters, setFilters] = useState({ 
    key: '', 
    language: '', 
    projectId: '', 
    status: 'all' 
  });
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({ 
    currentPage: 1, 
    totalPages: 1, 
    totalItems: 0 
  });
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(filters.key, 500);
  
  // Refs for optimization
  const isInitialized = useRef(false);

  // 🔥 UNIFIED INITIAL DATA FETCH
  const fetchInitialData = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      setLoading(true);
      console.log('🟢 Starting unified initial data fetch...');
      
      // Fetch all initial data
      const [projectsData, languagesData] = await Promise.all([
        API.get('/projects'),
        languageService.getLanguages()
      ]);

      console.log('Fetched projects:', projectsData.data);
      console.log('Fetched languages:', languagesData);

      const projects = Array.isArray(projectsData.data) ? projectsData.data : [];
      const languages = Array.isArray(languagesData) ? languagesData : [];
      
      setProjects(projects);
      setAllLanguages(languages);

      // Select first project by default and update filters
      if (projects.length > 0) {
        const firstProject = projects[0];
        setSelectedProject(firstProject);
        setFilters(prev => ({ ...prev, projectId: firstProject._id }));
        
        // Fetch project-specific data
        await fetchProjectLanguages(firstProject._id);
      }
      
      isInitialized.current = true;
      console.log('🟢 Unified initial data fetch completed');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      handleApiError(error, 'Failed to load data from server');
      setError("Could not load initial data. Please try again later.");
      setProjects([]);
      setAllLanguages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 UNIFIED PROJECT LANGUAGES FETCH
  const fetchProjectLanguages = useCallback(async (projectId) => {
    if (!projectId) return;
    
    try {
      console.log('🔵 Fetching languages for project:', projectId);
      const projectLanguagesData = await projectService.getProjectLanguages(projectId);
      console.log('🔵 Received project languages data:', projectLanguagesData);
      
      // Handle both array response and object with languages property
      let languages;
      if (Array.isArray(projectLanguagesData)) {
        languages = projectLanguagesData;
      } else if (projectLanguagesData && projectLanguagesData.languages) {
        languages = projectLanguagesData.languages;
      } else {
        languages = [];
      }
      
      console.log('🔵 Setting project languages:', languages);
      setProjectLanguages(languages);
    } catch (error) {
      console.error('Error fetching project languages:', error);
      setProjectLanguages([]);
    }
  }, []);

  // 🔥 UNIFIED TRANSLATIONS FETCH - Supports both approaches
  const fetchTranslations = useCallback(async () => {
    if (!filters.projectId) {
      setLoading(false);
      setTranslations([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching translations with unified approach...');
      
      // 🔥 TRY PAGINATED APPROACH FIRST (Team member's method)
      try {
        const response = await translationService.getTranslations(currentPage, 10, {
          key: debouncedSearchTerm,
          language: selectedLanguageFilter !== 'all' ? selectedLanguageFilter : filters.language,
          projectId: filters.projectId,
          status: filters.status !== 'all' ? filters.status : undefined,
        });
        
        // If successful, use paginated data
        console.log('✅ Using paginated translations:', response);
        setTranslations(response.data.translations || []);
        setPaginationData({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems
        });
        setError(null);
        return;
        
      } catch (pagError) {
        console.log('❌ Paginated method failed, trying direct method...');
        
        // 🔥 FALLBACK TO DIRECT APPROACH (Your method)
        const translationsData = await translationService.getTranslations({ 
          projectId: filters.projectId 
        });
        console.log('✅ Using direct translations:', translationsData);
        
        // Filter translations by language if needed
        let filteredTranslations = Array.isArray(translationsData) ? translationsData : [];
        
        // Apply filters manually for direct approach
        if (selectedLanguageFilter !== 'all' && filteredTranslations.length > 0) {
          filteredTranslations = filteredTranslations.filter(translation => {
            return translation.language === selectedLanguageFilter ||
                   translation.languageId === selectedLanguageFilter ||
                   translation.languageCode === selectedLanguageFilter ||
                   translation.languageName === selectedLanguageFilter;
          });
        }
        
        if (debouncedSearchTerm && filteredTranslations.length > 0) {
          filteredTranslations = filteredTranslations.filter(translation =>
            translation.translationKey?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            translation.value?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          );
        }
        
        setTranslations(filteredTranslations);
        // Set basic pagination for direct approach
        setPaginationData({
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredTranslations.length
        });
        setError(null);
      }
      
    } catch (error) {
      console.error('Error fetching translations:', error);
      setError('Failed to fetch translations.');
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filters.language, filters.projectId, filters.status, selectedLanguageFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch translations when dependencies change
  useEffect(() => {
    if (filters.projectId) {
      fetchTranslations();
    }
  }, [fetchTranslations]);

  // 🔥 UNIFIED EVENT HANDLERS
  
  // Filter change handler
  const handleFilterChange = useCallback((filterName, value) => {
    console.log('Filter changed:', filterName, value);
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, []);

  // Language filter handler
  const handleLanguageFilter = useCallback(async (languageFilter) => {
    console.log('Language filter changed to:', languageFilter);
    setSelectedLanguageFilter(languageFilter);
    setCurrentPage(1);
    // fetchTranslations will be triggered by useEffect
  }, []);

  // Project selection handler - UNIFIED
  const handleProjectSelect = useCallback(async (project) => {
    if (!project || (selectedProject && selectedProject._id === project._id)) {
      console.log('🚫 Skipping duplicate project selection');
      return;
    }
    
    console.log('🔵 Project selected:', project.name, 'ID:', project._id);
    setSelectedProject(project);
    setFilters(prev => ({ ...prev, projectId: project._id }));
    setSelectedLanguageFilter('all');
    setCurrentPage(1);
    
    // Fetch project-specific data
    await fetchProjectLanguages(project._id);
    // fetchTranslations will be triggered by useEffect
  }, [selectedProject, fetchProjectLanguages]);

  // Language assignment handler
  const handleLanguageAssign = useCallback(async (languageIds) => {
    if (!selectedProject) {
      showToast('Please select a project first', 'warning');
      return;
    }
    
    try {
      console.log('Starting language assignment...');
      
      const idsArray = Array.isArray(languageIds) ? languageIds : [languageIds];
      
      const languageCodes = idsArray.map(id => {
        const language = allLanguages.find(lang => lang._id === id);
        if (!language) {
          console.error('Language not found for ID:', id);
          return null;
        }
        return language.code;
      }).filter(code => code !== null);
      
      const assignedLanguageCodes = projectLanguages.map(lang => lang.code || lang);
      const newLanguageCodes = languageCodes.filter(code => !assignedLanguageCodes.includes(code));
      
      if (newLanguageCodes.length > 0) {
        await projectService.assignLanguagesToProject(selectedProject._id, newLanguageCodes);
        await fetchProjectLanguages(selectedProject._id);
        
        const assignedLanguageNames = allLanguages
          .filter(lang => newLanguageCodes.includes(lang.code))
          .map(lang => lang.name);
        
        const message = newLanguageCodes.length === 1 
          ? `${assignedLanguageNames[0]} assigned successfully!`
          : `${newLanguageCodes.length} languages assigned: ${assignedLanguageNames.join(', ')}`;
        showToast(message, 'success');
      }
      
      setAddLanguageModalOpen(false);
    } catch (error) {
      console.error('Error assigning language:', error);
      handleApiError(error, 'Failed to assign language(s)');
    }
  }, [selectedProject, allLanguages, projectLanguages, fetchProjectLanguages]);

  // Helper functions
  const getAssignedLanguageObjects = useCallback(() => {
    if (!projectLanguages || !allLanguages) return [];
    
    if (projectLanguages.length > 0 && projectLanguages[0].name) {
      return projectLanguages;
    }
    
    const assignedIdentifiers = Array.isArray(projectLanguages) ? projectLanguages : [];
    const assignedObjects = assignedIdentifiers
      .map(identifier => {
        let languageObject;
        
        if (typeof identifier === 'string') {
          languageObject = allLanguages.find(lang => lang.code === identifier) ||
                          allLanguages.find(lang => lang._id === identifier);
        } else if (identifier._id) {
          languageObject = allLanguages.find(lang => lang._id === identifier._id);
        }
        
        return languageObject;
      })
      .filter(lang => lang !== undefined);
    
    return assignedObjects;
  }, [projectLanguages, allLanguages]);

  // Modal and action handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleAddNew = useCallback(() => {
    setAddTranslationModalOpen(true);
  }, []);

  const handleEdit = useCallback((translation) => {
    setEditingTranslation(translation);
    setEditTranslationModalOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((translation) => {
    setDeleteTarget(translation);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      try {
        await translationService.deleteTranslation(deleteTarget._id);
        await fetchTranslations();
        showToast('Translation deleted successfully', 'success');
      } catch (err) {
        handleApiError(err, 'Failed to delete translation');
      } finally {
        setDeleteTarget(null);
      }
    }
  }, [deleteTarget, fetchTranslations]);

  const handleDownload = useCallback(async (format = 'json') => {
    if (!selectedProject) {
      showToast('Please select a project first.', 'warning');
      return;
    }
    
    try {
      console.log(`Starting download in ${format} format for project:`, selectedProject.name);
      await translationService.downloadTranslations(selectedProject._id, format);
      showToast(`Translations downloaded in ${format.toUpperCase()} format`, 'success');
    } catch (error) {
      console.error('Download failed:', error);
      handleApiError(error, 'Failed to download translations');
    }
  }, [selectedProject]);

  const handleRefresh = useCallback(async () => {
    if (!selectedProject) {
      showToast('Please select a project first.', 'warning');
      return;
    }
    
    try {
      console.log('Manual refresh triggered for project:', selectedProject.name);
      setLoading(true);
      
      await Promise.all([
        fetchProjectLanguages(selectedProject._id),
        fetchTranslations()
      ]);
      
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      handleApiError(error, 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, fetchProjectLanguages, fetchTranslations]);

  const handleNavigateToAnomalyDashboard = useCallback(() => {
    navigate('/anomaly-dashboard');
  }, [navigate]);

  const handleOpenLangModal = useCallback(() => {
    if (!filters.projectId) {
      alert('Please select a project first.');
      return;
    }
    setAssignLangModalOpen(true);
  }, [filters.projectId]);

  // Check if any modal is open
  const isAnyModalOpen = isAddLanguageModalOpen || isAddTranslationModalOpen || 
                        isEditTranslationModalOpen || isAssignLangModalOpen || !!deleteTarget;

  return (
    <>
      <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        {/* 🔥 UNIFIED HEADER - Supports both approaches */}
        <HomeHeader
          user={user}
          projects={projects}
          selectedProject={selectedProject}
          currentProjectId={filters.projectId}
          searchTerm={filters.key}
          onSearchChange={(e) => handleFilterChange('key', e.target.value)}
          onProjectSelect={handleProjectSelect}
          onProjectChange={(value) => {
            const project = projects.find(p => p._id === value);
            if (project) handleProjectSelect(project);
          }}
          onAssignLanguageClick={() => setAddLanguageModalOpen(true)}
          onAnomalyDashboardClick={handleNavigateToAnomalyDashboard}
          loading={loading}
        />
        
        {/* 🔥 UNIFIED TOOLBAR */}
        <HomeToolbar
          user={user}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddNewTranslation={handleAddNew}
          projectLanguages={projectLanguages}
          onDownload={handleDownload}
          onRefresh={handleRefresh}
          onLanguageFilter={handleLanguageFilter}
        />
        
        {/* Project Info Summary */}
        {selectedProject && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Project:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedProject.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Assigned Languages:</span>
                  <span className="ml-2 font-medium text-gray-900">{getAssignedLanguageObjects().length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Translations:</span>
                  <span className="ml-2 font-medium text-gray-900">{translations.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 UNIFIED CONTENT AREA */}
        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              <TranslationTable 
                user={user} 
                translations={translations} 
                onEdit={handleEdit} 
                onEditClick={() => setEditTranslationModalOpen(true)}
                onDelete={(id) => handleDeleteRequest(translations.find(t => t._id === id))}
                currentPage={paginationData.currentPage}
                itemsPerPage={10}
              />
              {paginationData.totalItems > 0 ? (
                <Pagination 
                  currentPage={paginationData.currentPage} 
                  totalItems={paginationData.totalItems} 
                  itemsPerPage={10} 
                  onPageChange={handlePageChange} 
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No translations found for the current selection.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🔥 UNIFIED MODALS */}
      <AddLanguageModal 
        isOpen={isAddLanguageModalOpen} 
        onClose={() => setAddLanguageModalOpen(false)}
        allLanguages={allLanguages}
        projectLanguages={projectLanguages}
        selectedProject={selectedProject}
        onLanguageAssign={handleLanguageAssign}
      />
      
      <AddTranslationModal
        isOpen={isAddTranslationModalOpen}
        onClose={() => setAddTranslationModalOpen(false)}
        onSave={fetchTranslations}
        projectId={filters.projectId}
        selectedProject={selectedProject}
        projectLanguages={projectLanguages}
      />
      
      <EditTranslationModal
        isOpen={isEditTranslationModalOpen}
        onClose={() => setEditTranslationModalOpen(false)}
        onSave={fetchTranslations}
        translation={editingTranslation}
      />
      
      <AssignLanguageModal
        isOpen={isAssignLangModalOpen}
        onClose={() => setAssignLangModalOpen(false)}
        project={selectedProject}
        onSuccess={fetchTranslations}
      />
      
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Translation"
        message={`Are you sure you want to permanently delete the translation for the key "${deleteTarget?.translationKey}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default Home;