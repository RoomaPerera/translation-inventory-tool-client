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

const Home = () => {
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

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLangModalOpen, setLangModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
      if (response.data.length > 0 && !filters.projectId) {
        setFilters((prev) => ({ ...prev, projectId: response.data[0]._id }));
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Could not load projects. Please try again later.");
    }
  }, [filters.projectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

  // Handle successful language assignment by refreshing both projects and translations
  const handleLanguageAssignmentSuccess = useCallback(() => {
    fetchProjects(); // Refresh project data to show updated language assignments
    fetchTranslations(); // Refresh translations in case new languages were added
  }, [fetchProjects, fetchTranslations]);

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

  // Direct delete function to pass to TranslationTable
  const handleDelete = async (translationId) => {
    try {
      await translationService.deleteTranslation(translationId);
      fetchTranslations(); // Refresh the list
    } catch (err) {
      alert("Failed to delete translation.");
    }
  };

  const isAnyModalOpen =
    isAddModalOpen || isEditModalOpen || isLangModalOpen;

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
        />
        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              {/* --- 5. Pass the correct handler to the table --- */}
              <TranslationTable
                user={user}
                translations={translations}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
                onSuccess={handleLanguageAssignmentSuccess}
            />
        </>
    );
};

export default Home;
