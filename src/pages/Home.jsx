import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HomeToolbar from '../components/home/HomeToolbar';
import TranslationTable from '../components/TranslationTable';
import AddTranslationModal from '../components/AddTranslationModal';
import EditTranslationModal from '../components/EditTranslationModal';
import AddLanguageModal from '../components/AddLanguageModal';
import { Pagination } from '../components/reusableComponents/Pagination';
import ErrorBoundary from '../components/ErrorBoundary';
import translationService from '../services/translationService';
import { useAuthContext } from '../hooks/useAuthContext';

const HomeContent = () => {
    const { user } = useAuthContext();
    const [translations, setTranslations] = useState([]);
    const [paginationData, setPaginationData] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Modal states
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isLangModalOpen, setLangModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState(null);

    // Filter states (you can add these based on your toolbar implementation)
    const [filters, setFilters] = useState({
        key: '',
        language: '',
        product: '',
        status: '',
        myWork: false
    });

    const fetchTranslations = useCallback(async (page = 1, currentFilters = filters) => {
        try {
            setLoading(true);
            setError(null);

            const response = await translationService.getTranslations(page, 10, currentFilters);

            if (response.data) {
                setTranslations(response.data.translations || []);
                setPaginationData({
                    currentPage: response.data.currentPage || page,
                    totalPages: response.data.totalPages || 1,
                    totalItems: response.data.totalItems || 0
                });
                setRetryCount(0); // Reset retry count on success
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching translations:', err);

            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch translations';

            // More specific error messages
            if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view translations.');
            } else if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else if (err.code === 'NETWORK_ERROR' || !err.response) {
                setError('Network error. Please check your connection and ensure the backend server is running.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial load
    useEffect(() => {
        fetchTranslations(currentPage);
    }, [currentPage, fetchTranslations]);

    // Refetch when filters change
    useEffect(() => {
        if (currentPage === 1) {
            fetchTranslations(1, filters);
        } else {
            setCurrentPage(1); // This will trigger the above effect
        }
    }, [filters]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchTranslations(currentPage);
    };

    // Modal handlers
    const handleAddNew = () => setAddModalOpen(true);
    const handleOpenLangModal = () => setLangModalOpen(true);

    const handleEdit = (translation) => {
        setEditingTranslation(translation);
        setEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this translation? This action cannot be undone.')) {
            return;
        }

        try {
            await translationService.deleteTranslation(id);

            // Refresh current page after delete
            await fetchTranslations(currentPage);

            // If current page becomes empty and we're not on page 1, go to previous page
            if (translations.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (err) {
            console.error('Error deleting translation:', err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete translation.');
        }
    };

    const handleModalSave = async () => {
        // Refresh translations after save
        await fetchTranslations(currentPage);
    };

    const handleAddModalClose = () => {
        setAddModalOpen(false);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setEditingTranslation(null);
    };

    const handleLangModalClose = () => {
        setLangModalOpen(false);
    };

    // Check if any modal is open for blur effect
    const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isLangModalOpen;

    // Loading component
    const LoadingComponent = () => (
        <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Translations...</p>
        </div>
    );

    // Error component
    const ErrorComponent = ({ error, onRetry }) => (
        <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Translations</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <div className="space-y-2">
                    <button
                        onClick={onRetry}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                    {retryCount > 2 && (
                        <p className="text-xs text-red-500">
                            If the problem persists, please contact support or check the server status.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Translations Found</h3>
                <p className="text-gray-500 text-sm mb-4">
                    {Object.values(filters).some(f => f && f !== false)
                        ? 'No translations match your current filters. Try adjusting your search criteria.'
                        : 'Get started by adding your first translation.'
                    }
                </p>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                    Add Translation
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
                <HomeHeader onAssignLanguageClick={handleOpenLangModal} />
                <HomeToolbar
                    onAddNewTranslation={handleAddNew}
                    onFilterChange={handleFilterChange}
                    currentFilters={filters}
                />

                <div className="flex-grow overflow-hidden bg-white rounded-lg shadow-sm flex flex-col">
                    {loading ? (
                        <LoadingComponent />
                    ) : error ? (
                        <ErrorComponent error={error} onRetry={handleRetry} />
                    ) : translations.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div className="flex-grow overflow-y-auto">
                                <TranslationTable
                                    translations={translations}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    currentUser={user}
                                />
                            </div>

                            {paginationData.totalItems > 0 && (
                                <div className="border-t bg-gray-50 px-4 py-3">
                                    <Pagination
                                        currentPage={paginationData.currentPage}
                                        totalItems={paginationData.totalItems}
                                        itemsPerPage={10}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddTranslationModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSave={handleModalSave}
                currentUser={user}
            />

            <EditTranslationModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSave={handleModalSave}
                translation={editingTranslation}
                currentUser={user}
                userService={null} // Replace with your user service if you have one
            />

            <AddLanguageModal
                isOpen={isLangModalOpen}
                onClose={handleLangModalClose}
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