import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import HomeHeader from "../components/home/HomeHeader";
import HomeToolbar from "../components/home/HomeToolbar";
import TranslationTable from "../components/TranslationTable";
import AddTranslationModal from "../components/AddTranslationModal";
import EditTranslationModal from "../components/EditTranslationModal";
import AssignProjectLanguageModal from "../components/AssignProjectLanguageModal";
import { Pagination } from "../components/reusableComponents/Pagination";
import useDebounce from "../hooks/useDebounce";
import translationService from "../services/translationService";
import projectService from "../services/projectService";
import API from "../services/axiosInstance";
import ConfirmModal from "../components/UserListComponents/ConfirmModal"; // <-- 1. Import the ConfirmModal
import ErrorBoundary from '../components/ErrorBoundary';

const HomeContent = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [translations, setTranslations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [paginationData, setPaginationData] = useState({

        currentPage: 1,

        totalPages: 1,

        totalItems: 0,

    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        key: "",
        language: "",
        projectId: "",
        status: "all",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchTerm = useDebounce(filters.key, 500);
    const [retryCount, setRetryCount] = useState(0);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLangModalOpen, setLangModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);


    // --- 2. State to manage the delete confirmation modal ---
    const [deleteTarget, setDeleteTarget] = useState(null); // Will hold the translation object to delete

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectService.getProjects();
                setProjects(response.data);
                if (response.data.length > 0) {
                    setFilters((prev) => ({ ...prev, projectId: response.data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
                setError("Could not load projects. Please try again later.");
            }
        };
        fetchProjects();
    }, []);

    // Listen for project creation events (including CSV imports)
  useEffect(() => {
    const handleProjectCreated = (event) => {
      const { project, hasCSVImport } = event.detail;
      console.log('Project created event received:', { project, hasCSVImport });
      
      // Refresh projects list
      fetchProjects();
      
      // If the new project has CSV imports, switch to it and refresh translations
      if (hasCSVImport && project?._id) {
        setFilters(prev => ({ 
          ...prev, 
          projectId: project._id,
          status: 'pending' // Show pending translations to see the imported CSV keys
        }));
        setCurrentPage(1);
      }
    };

    window.addEventListener('projectCreated', handleProjectCreated);
    
    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      setProjects(response.data);
      
      // If no project is currently selected and we have projects, select the first one
      if (!filters.projectId && response.data.length > 0) {
        setFilters((prev) => ({ ...prev, projectId: response.data[0]._id }));
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Could not load projects. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
    

    const fetchTranslations = useCallback(async () => {
        if (!filters.projectId) {
            setLoading(false);
            setTranslations([]);
            return;
        }
        setLoading(true);
        try {
            const response = await translationService.getTranslations(
                currentPage,
                10,
                {
                    key: debouncedSearchTerm,
                    language: filters.language,
                    projectId: filters.projectId,
                    status: filters.status !== "all" ? filters.status : undefined,
                }
            );
            setTranslations(response.data.translations);
            setPaginationData({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalItems: response.data.totalItems,
            });
            setError(null);
        } catch (err) {
            setError("Failed to fetch translations.");
        } finally {
            setLoading(false);
        }
    }, [
        currentPage,
        debouncedSearchTerm,
        filters.language,
        filters.projectId,
        filters.status,
    ]);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const handleNavigateToAnomalyDashboard = () => {
        navigate("/admin/anomalies");
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handleAddNew = () => setAddModalOpen(true);
    const handleOpenLangModal = () => {
        if (!filters.projectId) {
            alert("Please select a project first.");
            return;
        }
        setLangModalOpen(true);
    };
    const handleEdit = (translation) => {
        setEditingTranslation(translation);
        setEditModalOpen(true);
    };

    // --- 3. This function now ONLY opens the modal ---
    const handleDeleteRequest = (translation) => {
        setDeleteTarget(translation);
    };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      try {
        await translationService.deleteTranslation(deleteTarget._id);
        fetchTranslations();
      } catch (err) {
        alert("Failed to delete translation.");
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Download translations function
  const handleDownloadTranslations = async (format, currentFilters) => {
    try {
      // Fetch all translations for the current filters (without pagination)
      const response = await translationService.getTranslations(
        1,
        10000, // Large number to get all translations
        {
          key: currentFilters.key,
          language: currentFilters.language,
          projectId: currentFilters.projectId,
          status: currentFilters.status !== "all" ? currentFilters.status : undefined,
        }
      );

      const translationsData = response.data.translations;
      
      if (translationsData.length === 0) {
        alert('No translations found for the current filters.');
        return;
      }

      const project = projects.find(p => p._id === currentFilters.projectId);
      const projectName = project ? project.name : 'translations';
      const languageFilter = currentFilters.language ? `_${currentFilters.language}` : '';
      const statusFilter = currentFilters.status !== 'all' ? `_${currentFilters.status}` : '';
      const timestamp = new Date().toISOString().split('T')[0];
      
      const filename = `${projectName}${languageFilter}${statusFilter}_${timestamp}`;

      if (format === 'json') {
        downloadAsJSON(translationsData, filename);
      } else {
        downloadAsCSV(translationsData, filename);
      }

    } catch (error) {
      console.error('Error downloading translations:', error);
      throw error;
    }
  };

  // Helper function to download as JSON
  const downloadAsJSON = (data, filename) => {
    // Group translations by language for better JSON structure
    const groupedByLanguage = data.reduce((acc, translation) => {
      const lang = translation.language.toLowerCase();
      if (!acc[lang]) {
        acc[lang] = {};
      }
      acc[lang][translation.translationKey] = translation.translatedText || '';
      return acc;
    }, {});

    const jsonString = JSON.stringify(groupedByLanguage, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to download as CSV
  const downloadAsCSV = (data, filename) => {
    const headers = ['Translation Key', 'Language', 'Translation', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(translation => [
        `"${translation.translationKey}"`,
        `"${translation.language.toUpperCase()}"`,
        `"${(translation.translatedText || '').replace(/"/g, '""')}"`,
        `"${translation.status || 'pending'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

    const isAnyModalOpen =
        isAddModalOpen || isEditModalOpen || isLangModalOpen || !!deleteTarget;

  return (
    <>
      <div
        className={`flex flex-col h-full p-5 transition-filter duration-300 ${
          isAnyModalOpen ? "blur-sm" : ""
        }`}
      >
        <HomeHeader
          user={user}
          searchTerm={filters.key}
          onSearchChange={(e) => handleFilterChange("key", e.target.value)}
          onAssignLanguageClick={handleOpenLangModal}
          projects={projects}
          currentProjectId={filters.projectId}
          onProjectChange={(value) => handleFilterChange("projectId", value)}
          onAnomalyDashboardClick={handleNavigateToAnomalyDashboard}
        />
        <HomeToolbar
          user={user}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddNewTranslation={handleAddNew}
          onDownloadTranslations={handleDownloadTranslations}
        />
        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
                Loading translations...
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              <TranslationTable
                user={user}
                translations={translations}
                onEdit={handleEdit}
                onDelete={(id) =>
                  handleDeleteRequest(translations.find((t) => t._id === id))
                }
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
                  {filters.projectId ? (
                    <>
                      <div className="mb-2">No translations found for the current selection.</div>
                      <div className="text-sm text-gray-400">
                        {filters.status === 'pending' && 
                          "Try changing the status filter to 'Show All Entries' or import CSV keys in the project settings."
                        }
                        {filters.language && 
                          " Try selecting 'All Languages' or add translations for this language."
                        }
                        {filters.key && 
                          " Try clearing the search term or add new translation keys."
                        }
                      </div>
                    </>
                  ) : (
                    "Please select a project to view translations."
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddTranslationModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={fetchTranslations}
        projectId={filters.projectId}
        selectedProject={projects.find(p => p._id === filters.projectId)}
      />
      <EditTranslationModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={fetchTranslations}
        translation={editingTranslation}
        projects={projects}
        currentUser={user}
      />
      <AssignProjectLanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setLangModalOpen(false)}
        project={projects.find(p => p._id === filters.projectId)}
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

const Home = () => {
    return (
        <ErrorBoundary>
            <HomeContent />
        </ErrorBoundary>
    );
};

export default Home;