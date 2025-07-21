import React, { useState, useEffect, useCallback } from 'react';
import AllEntriesHeader from '../components/allEntries/AllEntriesHeader';
import AllEntriesToolbar from '../components/allEntries/AllEntriesToolbar';
import TranslationTable from '../components/TranslationTable';
import EditTranslationModal from '../components/EditTranslationModal';
import { Pagination } from '../components/reusableComponents/Pagination'; // Import pagination
import translationService from '../services/translationService';

const AllEntries = () => {
  const [translations, setTranslations] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
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
        <AllEntriesToolbar />
        
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
                    itemsPerPage={10}
                    onPageChange={handlePageChange}
                  />
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
      />
    </>
  );
};

export default AllEntries;