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
    
    // Filter state now includes projectId, defaulting to "All"
    const [filters, setFilters] = useState({ projectId: '' });

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
    }, [filters.projectId]); // Re-run when the project filter changes

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
        if (window.confirm('Are you sure you want to delete this translation?')) {
            try {
                await translationService.deleteTranslation(id);
                fetchTranslations(currentPage);
            } catch (err) {
                alert('Failed to delete translation.');
            }
        }
    };

    const isAnyModalOpen = isEditModalOpen;

    return (
        <>
            <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
                <AllEntriesHeader />
                {/* --- FIXED: Pass project data down to the toolbar --- */}
                <AllEntriesToolbar
                    projects={projects}
                    currentProjectId={filters.projectId}
                    onProjectChange={(value) => handleFilterChange('projectId', value)}
                />

                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center">Loading Translations...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>
                    ) : (
                        <>
                            <TranslationTable
                                translations={translations}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
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
            />
        </>
    );
};

export default AllEntries;