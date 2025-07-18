
import React, { useState } from 'react';

// Import all the new components
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import Toolbar from '../components/Dashboard/Toolbar';
import TranslationTable from '../components/Dashboard/TranslationTable';
import AddLanguageModal from '../components/Modals/AddLanguageModal';
import AddTranslationModal from '../components/Modals/AddTranslationModal'; // Assuming you have this file
import EditTranslationModal from '../components/Modals/EditTranslationModal'; // And this one

const AdminDashboard = () => {
  // State remains the same...
  const [isAddLanguageModalOpen, setAddLanguageModalOpen] = useState(false);
  const [isAddTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
  const [isEditTranslationModalOpen, setEditTranslationModalOpen] = useState(false);
  const [isRubixDropdownOpen, setRubixDropdownOpen] = useState(false);
  const [selectedRubixProduct, setSelectedRubixProduct] = useState('Rubix');

  const handleSelectRubix = (product) => {
    setSelectedRubixProduct(product);
    setRubixDropdownOpen(false);
  };
  
  const isAnyModalOpen = isAddLanguageModalOpen || isAddTranslationModalOpen || isEditTranslationModalOpen;

  // The main layout classes are applied here
  return (
    <>
      <div className={`flex min-h-screen bg-brand-bg-light ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <Sidebar />
        <main className="flex-grow p-5 bg-brand-bg-main">
          <Header
            isRubixDropdownOpen={isRubixDropdownOpen}
            onRubixDropdownToggle={() => setRubixDropdownOpen(!isRubixDropdownOpen)}
            selectedRubixProduct={selectedRubixProduct}
            onRubixProductSelect={handleSelectRubix}
            onAssignLanguageClick={() => setAddLanguageModalOpen(true)}
          />
          <Toolbar 
            onAddNewTranslationClick={() => setAddTranslationModalOpen(true)}
          />
          <TranslationTable 
            onEditClick={() => setEditTranslationModalOpen(true)}
          />
        </main>
      </div>

      {/* Render Modals Conditionally */}
      <AddLanguageModal 
        isOpen={isAddLanguageModalOpen} 
        onClose={() => setAddLanguageModalOpen(false)} 
      />
      <AddTranslationModal 
        isOpen={isAddTranslationModalOpen} 
        onClose={() => setAddTranslationModalOpen(false)} 
      />
      {/* Make sure you have a state for this modal as well */}
      <EditTranslationModal 
        isOpen={isEditTranslationModalOpen} 
        onClose={() => setEditTranslationModalOpen(false)} 
      />
    </>
  );
};

export default AdminDashboard;