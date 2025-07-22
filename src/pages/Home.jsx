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

const Home = () => {
  // All state management is correct
  const [translations, setTranslations] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ key: '', language: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(filters.key, 500);
  // Modal state...
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLangModalOpen, setLangModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = { key: debouncedSearchTerm, language: filters.language };
      Object.keys(activeFilters).forEach(key => { if (!activeFilters[key]) { delete activeFilters[key]; } });
      
      const response = await translationService.getTranslations(currentPage, 10, activeFilters);
      
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
  }, [currentPage, debouncedSearchTerm, filters.language]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);
  
  // Handler for all filter state updates
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  // All other handlers remain correct
  const handlePageChange = (page) => setCurrentPage(page);
  const handleAddNew = () => setAddModalOpen(true);
  const handleOpenLangModal = () => setLangModalOpen(true);
  const handleEdit = (translation) => { setEditingTranslation(translation); setEditModalOpen(true); };
  const handleDelete = async (id) => { if (window.confirm('Are you sure?')) { await translationService.deleteTranslation(id); fetchTranslations(); } };
  
  const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isLangModalOpen;

  return (
    <>
      <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <HomeHeader
          searchTerm={filters.key}
          // THE FIX IS HERE: We pass the event handler which will then update the state.
          onSearchChange={(e) => handleFilterChange('key', e.target.value)}
          onAssignLanguageClick={handleOpenLangModal}
        />
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
              {paginationData.totalItems > 0 && (
                <Pagination currentPage={paginationData.currentPage} totalItems={paginationData.totalItems} itemsPerPage={10} onPageChange={handlePageChange}/>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AddTranslationModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={fetchTranslations} />
      <EditTranslationModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={fetchTranslations} translation={editingTranslation} />
      <AddLanguageModal isOpen={isLangModalOpen} onClose={() => setLangModalOpen(false)} />
    </>
  );
};

export default Home;