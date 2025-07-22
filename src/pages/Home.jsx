import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HomeToolbar from '../components/home/HomeToolbar';
import TranslationTable from '../components/TranslationTable'; // This will be our updated table
import AddTranslationModal from '../components/AddTranslationModal';
import EditTranslationModal from '../components/EditTranslationModal';
import AddLanguageModal from '../components/AddLanguageModal';
import { Pagination } from '../components/reusableComponents/Pagination'; // Import pagination
import translationService from '../services/translationService';

const Home = () => {
  const [translations, setTranslations] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLangModalOpen, setLangModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);

  const fetchTranslations = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await translationService.getTranslations(page);
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
  }, []);

  useEffect(() => {
    fetchTranslations(currentPage);
  }, [currentPage, fetchTranslations]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddNew = () => setAddModalOpen(true);
  const handleOpenLangModal = () => setLangModalOpen(true);

  const handleEdit = (translation) => {
    setEditingTranslation(translation);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this translation?')) {
        try {
            await translationService.deleteTranslation(id);
            fetchTranslations(currentPage); // Refresh current page after delete
        } catch (err) {
            alert('Failed to delete translation.');
        }
    }
  };
  
  const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isLangModalOpen;

  return (
    <>
      <div className={`flex flex-col h-full p-5 transition-filter duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <HomeHeader onAssignLanguageClick={handleOpenLangModal} />
        <HomeToolbar onAddNewTranslation={handleAddNew} />
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
               {paginationData.totalItems > 0 && (
                 <Pagination
                    currentPage={paginationData.currentPage}
                    totalItems={paginationData.totalItems}
                    itemsPerPage={10} // Or from a state variable
                    onPageChange={handlePageChange}
                  />
               )}
            </>
          )}
        </div>
      </div>

      <AddTranslationModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={() => fetchTranslations(currentPage)} />
      <EditTranslationModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={() => fetchTranslations(currentPage)} translation={editingTranslation} />
      <AddLanguageModal isOpen={isLangModalOpen} onClose={() => setLangModalOpen(false)} />
    </>
  );
};

export default Home;