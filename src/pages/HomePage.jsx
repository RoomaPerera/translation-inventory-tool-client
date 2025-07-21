import React, { useState, useEffect, useRef } from 'react';

// Import styles
import '../components/Dashboard/Dashboard.css';

// Import utilities
import { showToast, handleApiError } from '../utils/notifications';

// Import all the new components
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import Toolbar from '../components/Dashboard/Toolbar';
import TranslationTable from '../components/Dashboard/TranslationTable';
import AddLanguageModal from '../components/Modals/AddLanguageModal';
import AddTranslationModal from '../components/Modals/AddTranslationModal';
import EditTranslationModal from '../components/Modals/EditTranslationModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Import services
import projectService from '../services/projectService';
import languageService from '../services/languageService';
import translationService from '../services/translationService';

const AdminDashboard = () => {
  // State for modals
  const [isAddLanguageModalOpen, setAddLanguageModalOpen] = useState(false);
  const [isAddTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
  const [isEditTranslationModalOpen, setEditTranslationModalOpen] = useState(false);
  
  // State for dropdowns
  const [isRubixDropdownOpen, setRubixDropdownOpen] = useState(false);
  const [showAllLanguagesDropdown, setShowAllLanguagesDropdown] = useState(false);
  
  // State for data
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allLanguages, setAllLanguages] = useState([]);
  const [projectLanguages, setProjectLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for dropdown management
  const allLanguagesDropdownRef = useRef(null);
  

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (allLanguagesDropdownRef.current && !allLanguagesDropdownRef.current.contains(event.target)) {
        setShowAllLanguagesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        await fetchTranslations(firstProject._id);
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
      console.log('🔵 Project languages length:', languages.length);
      console.log('🔵 Project languages type:', typeof languages, Array.isArray(languages));
      
      if (Array.isArray(languages)) {
        languages.forEach((lang, index) => {
          console.log(`Language ${index}:`, lang);
        });
      }
      
      setProjectLanguages(languages);
    } catch (error) {
      console.error('❌ Error fetching project languages:', error);
      setProjectLanguages([]);
    }
  };

  const fetchTranslations = async (projectId) => {
    try {
      console.log('Fetching translations for project:', projectId);
      // Fetch translations for the selected project from database
      const translationsData = await translationService.getTranslations({ 
        projectId: projectId 
      });
      console.log('Fetched translations:', translationsData);
      setTranslations(Array.isArray(translationsData) ? translationsData : []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      setTranslations([]);
    }
  };

  const handleProjectSelect = async (project) => {
    console.log('🔵 Project selected:', project.name, 'ID:', project._id);
    setSelectedProject(project);
    setRubixDropdownOpen(false);
    
    // Fetch data for the newly selected project
    await Promise.all([
      fetchProjectLanguages(project._id),
      fetchTranslations(project._id)
    ]);
  };

  // ENHANCED: Language assignment handler with real-time updates
  const handleLanguageAssign = async (languageIds) => {
    if (!selectedProject) {
      showToast('Please select a project first', 'warning');
      return;
    }
    
    try {
      console.log('🟡 Starting language assignment...');
      console.log('Selected project:', selectedProject);
      console.log('Language IDs to assign:', languageIds);
      
      // Handle both single ID and array of IDs
      const idsArray = Array.isArray(languageIds) ? languageIds : [languageIds];
      
      // Check for already assigned languages
      const assignedLanguageIds = projectLanguages.map(lang => lang._id);
      console.log('Currently assigned language IDs:', assignedLanguageIds);
      
      const alreadyAssigned = idsArray.filter(id => assignedLanguageIds.includes(id));
      
      if (alreadyAssigned.length > 0) {
        const assignedLanguageNames = allLanguages
          .filter(lang => alreadyAssigned.includes(lang._id))
          .map(lang => lang.name);
        
        if (alreadyAssigned.length === idsArray.length) {
          showToast(`Language${idsArray.length > 1 ? 's' : ''} already assigned: ${assignedLanguageNames.join(', ')}`, 'warning');
          return;
        } else {
          showToast(`Some languages already assigned: ${assignedLanguageNames.join(', ')}`, 'warning');
        }
      }
      
      // Only assign new languages
      const newLanguageIds = idsArray.filter(id => !assignedLanguageIds.includes(id));
      console.log('New language IDs to assign:', newLanguageIds);
      
      if (newLanguageIds.length > 0) {
        console.log('🟡 Calling API to assign languages...');
        await projectService.assignLanguagesToProject(selectedProject._id, newLanguageIds);
        console.log('✅ API call successful');
        
        // **CRITICAL: Refresh project languages to update all displays immediately**
        console.log('🟡 Refreshing project languages...');
        await fetchProjectLanguages(selectedProject._id);
        console.log('✅ Project languages refreshed');
        
        // **BONUS: Force close dropdown to show updated list**
        setShowAllLanguagesDropdown(false);
        
        const assignedLanguageNames = allLanguages
          .filter(lang => newLanguageIds.includes(lang._id))
          .map(lang => lang.name);
        
        const message = newLanguageIds.length === 1 
          ? `${assignedLanguageNames[0]} assigned successfully!`
          : `${newLanguageIds.length} languages assigned: ${assignedLanguageNames.join(', ')}`;
        showToast(message, 'success');
        
        console.log('✅ Language assignment completed successfully');
      }
      
      // Close the modal
      setAddLanguageModalOpen(false);
      
    } catch (error) {
      console.error('❌ Error assigning language:', error);
      handleApiError(error, 'Failed to assign language(s)');
      // Don't close modal on error so user can retry
    }
  };

  const handleQuickLanguageAssign = async (languageId) => {
    if (!selectedProject) {
      showToast('Please select a project first', 'warning');
      return;
    }

    try {
      console.log('🟡 Quick assigning language:', languageId);
      
      // Check if language is already assigned
      const isAlreadyAssigned = projectLanguages.some(lang => lang._id === languageId);
      if (isAlreadyAssigned) {
        const language = allLanguages.find(lang => lang._id === languageId);
        showToast(`${language?.name || 'Language'} is already assigned to this project`, 'warning');
        return;
      }

      await projectService.assignLanguagesToProject(selectedProject._id, [languageId]);
      
      // **CRITICAL: Refresh project languages to update display immediately**
      console.log('🟡 Refreshing after quick assign...');
      await fetchProjectLanguages(selectedProject._id);
      console.log('✅ Quick assign refresh completed');
      
      // Force close dropdown to show updated list
      setShowAllLanguagesDropdown(false);
      
      const language = allLanguages.find(lang => lang._id === languageId);
      showToast(`${language?.name || 'Language'} assigned successfully!`, 'success');
    } catch (error) {
      console.error('Error in quick language assign:', error);
      handleApiError(error, 'Failed to assign language');
    }
  };

  const handleDownload = async (format = 'json') => {
    if (!selectedProject) {
      showToast('Please select a project first.', 'warning');
      return;
    }
    
    try {
      await translationService.downloadTranslations(selectedProject._id, format);
      showToast(`Translations downloaded in ${format.toUpperCase()} format`, 'success');
    } catch (error) {
      handleApiError(error, 'Failed to download translations');
    }
  };

  const handleRefresh = async () => {
    if (selectedProject) {
      console.log('🟡 Manual refresh triggered...');
      await Promise.all([
        fetchProjectLanguages(selectedProject._id),
        fetchTranslations(selectedProject._id)
      ]);
      console.log('✅ Manual refresh completed');
      showToast('Data refreshed successfully', 'success');
    }
  };

  // Helper functions for language management
  const getAvailableLanguages = () => {
    const assignedLanguageIds = projectLanguages.map(lang => lang._id);
    return allLanguages.filter(lang => !assignedLanguageIds.includes(lang._id));
  };

  const getAssignedLanguageObjects = () => {
    return projectLanguages || [];
  };

  const isAnyModalOpen = isAddLanguageModalOpen || isAddTranslationModalOpen || isEditTranslationModalOpen;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow bg-white">
          <LoadingSpinner size="large" text="Loading dashboard data..." />
        </main>
      </div>
    );
  }

  return (
    <>
      <div className={`flex min-h-screen bg-gray-50 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <Sidebar />
        <main className="flex-grow p-5 bg-white">
          <Header
            isRubixDropdownOpen={isRubixDropdownOpen}
            onRubixDropdownToggle={() => setRubixDropdownOpen(!isRubixDropdownOpen)}
            selectedRubixProduct={selectedProject?.name || 'Select Project'}
            rubixOptions={projects}
            onRubixProductSelect={handleProjectSelect}
            onAssignLanguageClick={() => setAddLanguageModalOpen(true)}
          />
          
          {/* Enhanced Toolbar with Language Management */}
          <div className="mb-6">
            <Toolbar 
              onAddNewTranslationClick={() => setAddTranslationModalOpen(true)}
              projectLanguages={projectLanguages}
              onDownload={handleDownload}
              onRefresh={handleRefresh}
            />
            
            {/* Quick Language Management Section */}
            {selectedProject && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Quick Assign Languages */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Quick Assign:</span>
                      <div className="flex flex-wrap gap-1">
                        {getAvailableLanguages().slice(0, 3).map(language => (
                          <button
                            key={language._id}
                            onClick={() => handleQuickLanguageAssign(language._id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            + {language.name}
                          </button>
                        ))}
                        {getAvailableLanguages().length > 3 && (
                          <button
                            onClick={() => setAddLanguageModalOpen(true)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            +{getAvailableLanguages().length - 3} more
                          </button>
                        )}
                        {getAvailableLanguages().length === 0 && (
                          <span className="text-xs text-gray-500 italic">All languages assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* UPDATED: "All Languages" Button - Shows ONLY ASSIGNED languages */}
                  <div className="relative" ref={allLanguagesDropdownRef}>
                    <button
                      onClick={() => setShowAllLanguagesDropdown(!showAllLanguagesDropdown)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {/* UPDATED: Shows count of ASSIGNED languages only */}
                      <span>All Languages ({getAssignedLanguageObjects().length})</span>
                      <svg className={`w-4 h-4 transition-transform ${showAllLanguagesDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showAllLanguagesDropdown && (
                      <div className="absolute right-0 z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <div className="text-sm font-medium text-gray-700">
                            All Assigned Languages
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedProject.name} • {getAssignedLanguageObjects().length} languages
                          </div>
                        </div>
                        
                        {getAssignedLanguageObjects().length === 0 ? (
                          <div className="px-4 py-8 text-gray-500 text-sm text-center">
                            <div className="mb-2">No languages assigned yet</div>
                            <button 
                              onClick={() => {
                                setShowAllLanguagesDropdown(false);
                                setAddLanguageModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Assign your first language
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-48 overflow-y-auto">
                              {/* UPDATED: Shows ONLY ASSIGNED languages */}
                              {getAssignedLanguageObjects().map(language => (
                                <div
                                  key={language._id}
                                  className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">{language.name}</div>
                                      <div className="text-sm text-gray-500">Code: {language.code}</div>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                      <span className="text-xs text-green-600 font-medium">Active</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Show option to add more languages if available */}
                            {getAvailableLanguages().length > 0 && (
                              <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                  onClick={() => {
                                    setShowAllLanguagesDropdown(false);
                                    setAddLanguageModalOpen(true);
                                  }}
                                  className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add More Languages ({getAvailableLanguages().length} available)
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* UPDATED: Project Info Summary with clear labeling */}
                <div className="mt-4 pt-4 border-t border-gray-200">
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
        </main>
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
        isOpen={isAddTranslationModalOpen} 
        onClose={() => setAddTranslationModalOpen(false)} 
        selectedProject={selectedProject}
        projectLanguages={projectLanguages}
      />
      <EditTranslationModal 
        isOpen={isEditTranslationModalOpen} 
        onClose={() => setEditTranslationModalOpen(false)} 
      />
    </>
  );
};

export default AdminDashboard;