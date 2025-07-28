import React, { useState, useEffect, useCallback } from 'react';
import AllEntriesHeader from '../components/allEntries/AllEntriesHeader';
import AllEntriesToolbar from '../components/allEntries/AllEntriesToolbar';
import TranslationTable from '../components/TranslationTable';
import EditTranslationModal from '../components/EditTranslationModal';
import { Pagination } from '../components/reusableComponents/Pagination';
import translationService from '../services/translationService';
import API from '../services/axiosInstance'; // Import API for fetching projects
import { useAuthContext } from '../hooks/useAuthContext';

const AllEntries = () => {
    const { user } = useAuthContext();
    const [translations, setTranslations] = useState([]);
    const [projects, setProjects] = useState([]); // State for the project list
    const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter state now includes projectId and language, defaulting to "All"
    const [filters, setFilters] = useState({ projectId: '', language: 'all' });

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState(null);

    // Fetch projects when the component mounts
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await API.get('/projects');
                setProjects(response.data);
            } catch (err) {
                console.error("Failed to fetch projects", err);
            }
        };
        fetchProjects();
    }, []);

    const fetchTranslations = useCallback(async (page) => {
        setLoading(true);
        try {
            const activeFilters = {};
            // Only add the projectId to the filter if one is actually selected
            if (filters.projectId) {
                activeFilters.projectId = filters.projectId;
            }
            // Only add the language to the filter if one is actually selected (not 'all')
            if (filters.language && filters.language !== 'all') {
                activeFilters.language = filters.language;
            }

            const response = await translationService.getTranslations(page, 10, activeFilters);
            setTranslations(response.data.translations);
            setPaginationData({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalItems: response.data.totalItems
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch translations. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    }, [filters.projectId, filters.language]); // Re-run when the project or language filter changes

    useEffect(() => {
        fetchTranslations(currentPage);
    }, [currentPage, fetchTranslations]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEdit = (translation) => {
        setEditingTranslation(translation);
        setEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await translationService.deleteTranslation(id);
            fetchTranslations(currentPage);
        } catch (err) {
            alert('Failed to delete translation.');
        }
    };

    const isAnyModalOpen = isEditModalOpen;

    // Role-based access control - only allow admin and developer roles
    if (!user) {
        return (
            <div className="flex flex-col h-full p-5">
                <div className="p-8 text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    const allowedRoles = ["Admin", "admin", "Developer", "developer"];
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="flex flex-col h-full p-5">
                <div className="p-8 text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
                    <div className="text-gray-600">This page is restricted to admins and developers only.</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
                <AllEntriesHeader />
                {/* --- FIXED: Pass project and language data down to the toolbar --- */}
                <AllEntriesToolbar
                    projects={projects}
                    currentProjectId={filters.projectId}
                    onProjectChange={(value) => handleFilterChange('projectId', value)}
                    currentLanguage={filters.language}
                    onLanguageChange={(value) => handleFilterChange('language', value)}
                />

                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center">Loading Translations...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>
                    ) : (
                        <>
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
                                <div className="p-8 text-center text-gray-500">No translations found for the current selection.</div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <EditTranslationModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={() => fetchTranslations(currentPage)}
                translation={editingTranslation}
                currentUser={user}
                projects={projects}
            />
        </>
    );
};

export default AllEntries;