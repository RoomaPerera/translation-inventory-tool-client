import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HomeToolbar from '../components/home/HomeToolbar';
import TranslationTable from '../components/TranslationTable';
import AddTranslationModal from '../components/AddTranslationModal';
import EditTranslationModal from '../components/EditTranslationModal';
import AddLanguageModal from '../components/AddLanguageModal';
import { Pagination } from '../components/reusableComponents/Pagination';
import useDebounce from '../hooks/useDebounce';
import translationService from '../services/translationService';
import API from '../services/axiosInstance';

const Home = () => {
    const [translations, setTranslations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ key: '', language: '', projectId: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchTerm = useDebounce(filters.key, 500);

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isLangModalOpen, setLangModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await API.get('/projects');
                setProjects(response.data);
                if (response.data.length > 0) {
                    setFilters(prev => ({ ...prev, projectId: response.data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
                setError("Could not load projects. Please try again later.");
            }
        };
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

    const handlePageChange = (page) => setCurrentPage(page);
    const handleAddNew = () => setAddModalOpen(true);
    const handleOpenLangModal = () => setLangModalOpen(true);
    const handleEdit = (translation) => { setEditingTranslation(translation); setEditModalOpen(true); };
    const handleDelete = async (id) => { await translationService.deleteTranslation(id); fetchTranslations(); };

    const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isLangModalOpen;

    return (
        <>
            <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
                {/* --- FIXED: Pass project data to HomeHeader --- */}
                <HomeHeader
                    searchTerm={filters.key}
                    onSearchChange={(e) => handleFilterChange('key', e.target.value)}
                    onAssignLanguageClick={handleOpenLangModal}
                    projects={projects}
                    currentProjectId={filters.projectId}
                    onProjectChange={(value) => handleFilterChange('projectId', value)}
                />
                {/* HomeToolbar no longer needs project props */}
                <HomeToolbar
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
                            <TranslationTable translations={translations} onEdit={handleEdit} onDelete={handleDelete} />
                            {paginationData.totalItems > 0 ? (
                                <Pagination currentPage={paginationData.currentPage} totalItems={paginationData.totalItems} itemsPerPage={10} onPageChange={handlePageChange} />
                            ) : (
                                <div className="p-8 text-center text-gray-500">No translations found for the current selection.</div>
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
            />
            <EditTranslationModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={fetchTranslations}
                translation={editingTranslation}
            />
            <AddLanguageModal
                isOpen={isLangModalOpen}
                onClose={() => setLangModalOpen(false)}
            />
        </>
    );
};

export default Home;