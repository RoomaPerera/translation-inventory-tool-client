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

  // Monitor projectLanguages changes for debugging
  useEffect(() => {
    console.log('🔄 ProjectLanguages state updated:', projectLanguages);
    console.log('🔄 Current assigned languages count:', projectLanguages?.length || 0);
    if (projectLanguages && projectLanguages.length > 0) {
      console.log('🔄 Assigned language names:', projectLanguages.map(lang => lang.name).join(', '));
    }
  }, [projectLanguages]);

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


// UPDATED: Language assignment handler - now sends language CODES instead of IDs
const handleLanguageAssign = async (languageIds) => {
  if (!selectedProject) {
    showToast('Please select a project first', 'warning');
    return;
  }
  
  try {
    console.log('🟡 Starting language assignment...');
    console.log('Selected project:', selectedProject);
    console.log('Language IDs received from modal:', languageIds);
    
    // Handle both single ID and array of IDs
    const idsArray = Array.isArray(languageIds) ? languageIds : [languageIds];
    
    // **NEW: Convert language IDs to language CODES**
    const languageCodes = idsArray.map(id => {
      const language = allLanguages.find(lang => lang._id === id);
      if (!language) {
        console.error('❌ Language not found for ID:', id);
        return null;
      }
      console.log(`🔄 Converting ID ${id} to code: ${language.code}`);
      return language.code;
    }).filter(code => code !== null); // Remove any null values
    
    console.log('🟡 Language codes to assign:', languageCodes);
    
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
      console.log('🟡 Calling API to assign language CODES...');
      
      // **UPDATED: Send language CODES instead of IDs to the API**
      await projectService.assignLanguagesToProject(selectedProject._id, newLanguageCodes);
      console.log('✅ API call successful with language codes');
      
      // Refresh project languages to update displays
      console.log('🟡 Refreshing project languages...');
      await fetchProjectLanguages(selectedProject._id);
      console.log('✅ Project languages refreshed');
      
      setShowAllLanguagesDropdown(false);
      setRubixDropdownOpen(false);
      
      // Get language names for success message
      const assignedLanguageNames = allLanguages
        .filter(lang => newLanguageCodes.includes(lang.code))
        .map(lang => lang.name);
      
      const message = newLanguageCodes.length === 1 
        ? `${assignedLanguageNames[0]} assigned successfully!`
        : `${newLanguageCodes.length} languages assigned: ${assignedLanguageNames.join(', ')}`;
      showToast(message, 'success');
      
      console.log('✅ Language assignment completed with codes');
    }
    
    // Close the modal
    setAddLanguageModalOpen(false);
    
  } catch (error) {
    console.error('❌ Error assigning language:', error);
    handleApiError(error, 'Failed to assign language(s)');
    // Don't close modal on error so user can retry
  }
};

// UPDATED: Quick language assignment handler - also sends CODES instead of IDs
const handleQuickLanguageAssign = async (languageId) => {
  if (!selectedProject) {
    showToast('Please select a project first', 'warning');
    return;
  }

  try {
    console.log('🟡 Quick assigning language ID:', languageId);
    
    // **NEW: Convert language ID to language CODE**
    const language = allLanguages.find(lang => lang._id === languageId);
    if (!language) {
      showToast('Language not found', 'error');
      return;
    }
    
    const languageCode = language.code;
    console.log(`🔄 Converting ID ${languageId} to code: ${languageCode}`);
    
    // Check if language is already assigned (comparing codes)
    const assignedLanguageCodes = projectLanguages.map(lang => lang.code || lang);
    const isAlreadyAssigned = assignedLanguageCodes.includes(languageCode);
    
    if (isAlreadyAssigned) {
      showToast(`${language.name} is already assigned to this project`, 'warning');
      return;
    }

    console.log('🟡 Calling API to assign language CODE:', languageCode);
    
    // **UPDATED: Send language CODE instead of ID**
    await projectService.assignLanguagesToProject(selectedProject._id, [languageCode]);
    
    // Refresh project languages
    console.log('🟡 Refreshing after quick assign...');
    await fetchProjectLanguages(selectedProject._id);
    console.log('✅ Quick assign refresh completed');
    
    setShowAllLanguagesDropdown(false);
    setRubixDropdownOpen(false);
    
    showToast(`${language.name} assigned successfully!`, 'success');
    console.log('✅ Quick language assignment completed with code');
  } catch (error) {
    console.error('Error in quick language assign:', error);
    handleApiError(error, 'Failed to assign language');
  }
};

// UPDATED: Helper function to handle both ID and CODE responses
const getAssignedLanguageObjects = () => {
  if (!projectLanguages || !allLanguages) return [];
  
  // If projectLanguages contains full objects, use them directly
  if (projectLanguages.length > 0 && projectLanguages[0].name) {
    console.log('🔍 Using full language objects from projectLanguages:', projectLanguages.length);
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
        console.warn('⚠️ Could not find language for identifier:', identifier);
      }
      
      return languageObject;
    })
    .filter(lang => lang !== undefined); // Remove any undefined results
  
  console.log('🔍 Mapped assigned identifiers to objects:', assignedObjects.length);
  console.log('🔍 Assigned languages:', assignedObjects.map(lang => `${lang.name}(${lang.code})`).join(', '));
  
  return assignedObjects;
};

// ADDED: Missing handleDownload function
const handleDownload = async (format = 'json') => {
  if (!selectedProject) {
    showToast('Please select a project first.', 'warning');
    return;
  }
  
  try {
    console.log(`🔵 Starting download in ${format} format for project:`, selectedProject.name);
    await translationService.downloadTranslations(selectedProject._id, format);
    showToast(`Translations downloaded in ${format.toUpperCase()} format`, 'success');
    console.log('✅ Download completed successfully');
  } catch (error) {
    console.error('❌ Download failed:', error);
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
    console.log('🔄 Manual refresh triggered for project:', selectedProject.name);
    setLoading(true);
    
    // Refresh both project languages and translations
    await Promise.all([
      fetchProjectLanguages(selectedProject._id),
      fetchTranslations(selectedProject._id)
    ]);
    
    console.log('✅ Manual refresh completed successfully');
    showToast('Data refreshed successfully', 'success');
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    handleApiError(error, 'Failed to refresh data');
  } finally {
    setLoading(false);
  }
};

// Helper functions for language management
const getAvailableLanguages = () => {
  const assignedLanguageCodes = projectLanguages.map(lang => lang.code || lang);
  return allLanguages.filter(lang => !assignedLanguageCodes.includes(lang.code));
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