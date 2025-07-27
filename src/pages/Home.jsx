import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import utilities
import { showToast, handleApiError } from '../utils/notifications';

import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

// Import all the components (NO SIDEBAR - it's in ProtectedLayout)
import HomeHeader from '../components/home/HomeHeader';
import HomeToolbar from '../components/home/HomeToolbar';
import TranslationTable from '../components/TranslationTable';
import AddTranslationModal from '../components/AddTranslationModal';
import AddLanguageModal from '../components/ProjectLanguageComponents/AssignLanguageModal';
import EditTranslationModal from '../components/EditTranslationModal';
import { Pagination } from '../components/reusableComponents/Pagination';
import useDebounce from '../hooks/useDebounce';
import API from '../services/axiosInstance';
import ConfirmModal from '../components/UserListComponents/ConfirmModal'; // <-- 1. Import the ConfirmModal

// Import services
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import translationService from '../services/translationService';

const Home = () => {
  // State for modals
  const [isAddLanguageModalOpen, setAddLanguageModalOpen] = useState(false);
  const [isAddTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
  const [isEditTranslationModalOpen, setEditTranslationModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);


  // State for data
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [translations, setTranslations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [allLanguages, setAllLanguages] = useState([]);
  const [projectLanguages, setProjectLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('all');
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ key: '', language: '', projectId: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(filters.key, 500);

// --- 2. State to manage the delete confirmation modal ---
    const [deleteTarget, setDeleteTarget] = useState(null); // Will hold the translation object to delete


  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);



// Use ref to track if projects have been fetched
const projectsFetched = useRef(false);

// Memoize the fetch function to prevent unnecessary re-renders
// merging both codes - Nethma , Sajimithan
const fetchProjects = useCallback(async () => {
  if (projectsFetched.current) return; // Prevent duplicate fetches
  
  try {
    const response = await API.get('/projects');
    setProjects(response.data);
    if (response.data.length > 0) {
      setFilters(prev => ({ ...prev, projectId: response.data[0]._id }));
    }
    projectsFetched.current = true; // Mark as fetched
  } catch (err) {
    console.error("Failed to fetch projects", err);
    setError("Could not load projects. Please try again later.");
  }
}, [setProjects, setFilters, setError]);

// Combined useEffect
useEffect(() => {
  // Handle projectLanguages logging
  console.log('ProjectLanguages state updated:', projectLanguages);
  console.log('Current assigned languages count:', projectLanguages?.length || 0);
  if (projectLanguages && projectLanguages.length > 0) {
    console.log('Assigned language names:', projectLanguages.map(lang => lang.name).join(', '));
  }

  // Fetch projects on mount
  fetchProjects();
}, [projectLanguages, fetchProjects]);


  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects and languages from database
      const [projectsData, languagesData] = await Promise.all([
        projectService.getProjects(),
        languageService.getLanguages()
      ]);

      console.log('Fetched projects:', projectsData);
      console.log('Fetched languages:', languagesData);

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setAllLanguages(Array.isArray(languagesData) ? languagesData : []);

      // Select first project by default
      if (projectsData && projectsData.length > 0) {
        const firstProject = projectsData[0];
        setSelectedProject(firstProject);
        await fetchProjectLanguages(firstProject._id);
        await fetchTranslations(firstProject._id, 'all');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      handleApiError(error, 'Failed to load data from server');
      // Set empty arrays on error to prevent crashes
      setProjects([]);
      setAllLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectLanguages = async (projectId) => {
    try {
      console.log('Fetching languages for project:', projectId);
      const projectLanguagesData = await projectService.getProjectLanguages(projectId);
      console.log('Received project languages data:', projectLanguagesData);
      
      // Handle both array response and object with languages property
      let languages;
      if (Array.isArray(projectLanguagesData)) {
        languages = projectLanguagesData;
      } else if (projectLanguagesData && projectLanguagesData.languages) {
        languages = projectLanguagesData.languages;
      } else {
        languages = [];
      }
      
      console.log('Setting project languages:', languages);
      console.log('Project languages length:', languages.length);
      console.log('Project languages type:', typeof languages, Array.isArray(languages));
      
      if (Array.isArray(languages)) {
        languages.forEach((lang, index) => {
          console.log(`Language ${index}:`, lang);
        });
      }
      
      setProjectLanguages(languages);
    } catch (error) {
      console.error('Error fetching project languages:', error);
      setProjectLanguages([]);
    }
  };

     const fetchTranslations = useCallback(async () => {
        if (!filters.projectId) {
            setLoading(false);
            setTranslations([]);
            return;
        }
        setLoading(true);
        try {
            const response = await translationService.getTranslations(currentPage, 10, {
                key: debouncedSearchTerm,
                language: filters.language,
                projectId: filters.projectId,
            });
            setTranslations(response.data.translations);
            setPaginationData({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalItems: response.data.totalItems
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch translations.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, filters.language, filters.projectId]);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);


    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const handleNavigateToAnomalyDashboard = () => {
        navigate('/anomaly-dashboard');
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handleAddNew = () => setAddModalOpen(true);
    const handleOpenLangModal = () => setLangModalOpen(true);
    const handleEdit = (translation) => { setEditingTranslation(translation); setEditModalOpen(true); };
    
    // --- 3. This function now ONLY opens the modal ---
    const handleDeleteRequest = (translation) => {
        setDeleteTarget(translation);
    };

    // --- 4. This new function performs the actual deletion ---
    const handleConfirmDelete = async () => {
        if (deleteTarget) {
            try {
                await translationService.deleteTranslation(deleteTarget._id);
                fetchTranslations(); // Refresh the list
            } catch (err) {
                alert("Failed to delete translation.");
            } finally {
                setDeleteTarget(null); // Close the modal
            }
        }
    };

  // Handle language filter changes
  const handleLanguageFilter = async (languageFilter) => {
    console.log('Language filter changed to:', languageFilter);
    setSelectedLanguageFilter(languageFilter);
    if (selectedProject) {
      await fetchTranslations(selectedProject._id, languageFilter);
    }
  };

  const handleProjectSelect = async (project) => {
    console.log('Project selected:', project.name, 'ID:', project._id);
    setSelectedProject(project);
    setSelectedLanguageFilter('all'); // Reset language filter when switching projects
    
    // Fetch data for the newly selected project
    await Promise.all([
      fetchProjectLanguages(project._id),
      fetchTranslations(project._id, 'all') // Reset to show all languages
    ]);
  };

  // UPDATED: Language assignment handler - now sends language CODES instead of IDs
  const handleLanguageAssign = async (languageIds) => {
    if (!selectedProject) {
      showToast('Please select a project first', 'warning');
      return;
    }
    
    try {
      console.log('Starting language assignment...');
      console.log('Selected project:', selectedProject);
      console.log('Language IDs received from modal:', languageIds);
      
      // Handle both single ID and array of IDs
      const idsArray = Array.isArray(languageIds) ? languageIds : [languageIds];
      
      // **NEW: Convert language IDs to language CODES**
      const languageCodes = idsArray.map(id => {
        const language = allLanguages.find(lang => lang._id === id);
        if (!language) {
          console.error('Language not found for ID:', id);
          return null;
        }
        console.log(`Converting ID ${id} to code: ${language.code}`);
        return language.code;
      }).filter(code => code !== null); // Remove any null values
      
      console.log('Language codes to assign:', languageCodes);
      
      // Check for already assigned languages (now comparing codes)
      const assignedLanguageCodes = projectLanguages.map(lang => {
        // Handle both cases: if projectLanguages contains full objects or just codes
        return lang.code || lang;
      });
      console.log('Currently assigned language codes:', assignedLanguageCodes);
      
      const alreadyAssigned = languageCodes.filter(code => assignedLanguageCodes.includes(code));
      
      if (alreadyAssigned.length > 0) {
        const assignedLanguageNames = allLanguages
          .filter(lang => alreadyAssigned.includes(lang.code))
          .map(lang => lang.name);
        
        if (alreadyAssigned.length === languageCodes.length) {
          showToast(`Language${languageCodes.length > 1 ? 's' : ''} already assigned: ${assignedLanguageNames.join(', ')}`, 'warning');
          return;
        } else {
          showToast(`Some languages already assigned: ${assignedLanguageNames.join(', ')}`, 'warning');
        }
      }
      
      // Only assign new languages
      const newLanguageCodes = languageCodes.filter(code => !assignedLanguageCodes.includes(code));
      console.log('New language codes to assign:', newLanguageCodes);
      
      if (newLanguageCodes.length > 0) {
        console.log('Calling API to assign language CODES...');
        
        // **UPDATED: Send language CODES instead of IDs to the API**
        await projectService.assignLanguagesToProject(selectedProject._id, newLanguageCodes);
        console.log('API call successful with language codes');
        
        // Refresh project languages to update displays
        console.log('Refreshing project languages...');
        await fetchProjectLanguages(selectedProject._id);
        console.log('Project languages refreshed');
        
        // Get language names for success message
        const assignedLanguageNames = allLanguages
          .filter(lang => newLanguageCodes.includes(lang.code))
          .map(lang => lang.name);
        
        const message = newLanguageCodes.length === 1 
          ? `${assignedLanguageNames[0]} assigned successfully!`
          : `${newLanguageCodes.length} languages assigned: ${assignedLanguageNames.join(', ')}`;
        showToast(message, 'success');
        
        console.log('Language assignment completed with codes');
      }
      
      // Close the modal
      setAddLanguageModalOpen(false);
      
    } catch (error) {
      console.error('Error assigning language:', error);
      handleApiError(error, 'Failed to assign language(s)');
      // Don't close modal on error so user can retry
    }
  };

  // UPDATED: Helper function to handle both ID and CODE responses
  const getAssignedLanguageObjects = () => {
    if (!projectLanguages || !allLanguages) return [];
    
    // If projectLanguages contains full objects, use them directly
    if (projectLanguages.length > 0 && projectLanguages[0].name) {
      console.log('Using full language objects from projectLanguages:', projectLanguages.length);
      return projectLanguages;
    }
    
    // **UPDATED: Handle both language IDs and CODES from projectLanguages**
    const assignedIdentifiers = Array.isArray(projectLanguages) ? projectLanguages : [];
    const assignedObjects = assignedIdentifiers
      .map(identifier => {
        // Handle string codes, string IDs, or objects with _id
        let languageObject;
        
        if (typeof identifier === 'string') {
          // Try to find by code first, then by ID
          languageObject = allLanguages.find(lang => lang.code === identifier) ||
                          allLanguages.find(lang => lang._id === identifier);
        } else if (identifier._id) {
          // Object with _id property
          languageObject = allLanguages.find(lang => lang._id === identifier._id);
        }
        
        if (!languageObject) {
          console.warn('Could not find language for identifier:', identifier);
        }
        
        return languageObject;
      })
      .filter(lang => lang !== undefined); // Remove any undefined results
    
    console.log('Mapped assigned identifiers to objects:', assignedObjects.length);
    console.log('Assigned languages:', assignedObjects.map(lang => `${lang.name}(${lang.code})`).join(', '));
    
    return assignedObjects;
  };

  // ADDED: Missing handleDownload function
  const handleDownload = async (format = 'json') => {
    if (!selectedProject) {
      showToast('Please select a project first.', 'warning');
      return;
    }
    
    try {
      console.log(`Starting download in ${format} format for project:`, selectedProject.name);
      await translationService.downloadTranslations(selectedProject._id, format);
      showToast(`Translations downloaded in ${format.toUpperCase()} format`, 'success');
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      handleApiError(error, 'Failed to download translations');
    }
  };

  // ADDED: Missing handleRefresh function
  const handleRefresh = async () => {
    if (!selectedProject) {
      showToast('Please select a project first.', 'warning');
      return;
    }
    
    try {
      console.log('Manual refresh triggered for project:', selectedProject.name);
      setLoading(true);
      
      // Refresh both project languages and translations
      await Promise.all([
        fetchProjectLanguages(selectedProject._id),
        fetchTranslations(selectedProject._id, selectedLanguageFilter)
      ]);
      
      console.log('Manual refresh completed successfully');
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      handleApiError(error, 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const isAnyModalOpen = isAddLanguageModalOpen || isAddTranslationModalOpen || isEditTranslationModalOpen;

  return (
    <>
 <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <HomeHeader
          user={user}
          searchTerm={filters.key}
          onSearchChange={(e) => handleFilterChange('key', e.target.value)}
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          onAssignLanguageClick={() => setAddLanguageModalOpen(true)}
          loading={loading}
          currentProjectId={filters.projectId}
          onAnomalyDashboardClick={handleNavigateToAnomalyDashboard}
          onProjectChange={(value) => handleFilterChange('projectId', value)}

        />
        
        {/* Enhanced Toolbar with Language Management */}
        <div className="mb-6">
          <HomeToolbar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddNewTranslation={handleAddNew}
            projectLanguages={projectLanguages}
            onDownload={handleDownload}
            onRefresh={handleRefresh}
            onLanguageFilter={handleLanguageFilter}
          />
          
<div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center">Loading...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : (
                        <>
                            {/* --- 5. Pass the correct handler to the table --- */}
                            <TranslationTable translations={translations} onEdit={handleEdit} onDelete={(id) => handleDeleteRequest(translations.find(t => t._id === id))} />
                            {paginationData.totalItems > 0 ? (
                                <Pagination currentPage={paginationData.currentPage} totalItems={paginationData.totalItems} itemsPerPage={10} onPageChange={handlePageChange} />
                            ) : (
                                <div className="p-8 text-center text-gray-500">No translations found for the current selection.</div>
                            )}
                        </>
                    )}
                </div>

          {/* Quick Language Management Section */}
          {selectedProject && (
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              {/* UPDATED: Project Info Summary with clear labeling */}
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
        </div>

        <TranslationTable 
          translations={translations}
          onEditClick={() => setEditTranslationModalOpen(true)}
        />
      </div>

      {/* ENHANCED: Modals with Updated Props */}
      <AddLanguageModal 
        isOpen={isAddLanguageModalOpen} 
        onClose={() => setAddLanguageModalOpen(false)}
        allLanguages={allLanguages}
        projectLanguages={projectLanguages}
        selectedProject={selectedProject}
        onLanguageAssign={handleLanguageAssign}  // Enhanced handler
      />
      <AddTranslationModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={fetchTranslations}
                projectId={filters.projectId}
            />

      <EditTranslationModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={fetchTranslations}
                translation={editingTranslation}
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