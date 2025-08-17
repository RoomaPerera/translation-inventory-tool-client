import React from 'react';

const LanguageTab = ({
  languages,
  isLoadingLanguages,
  handleAddLanguage,
  handleEditLanguage,
  handleDeleteLanguage,
  LanguageManagement
}) => (
  <div>
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        <h2 className="text-xl font-semibold text-gray-800">Language Management</h2>
      </div>
      <p className="text-gray-600">
        Add and configure supported languages for your projects
      </p>
    </div>
    <div className="space-y-6">
      <LanguageManagement
        languages={Array.isArray(languages) ? languages : []}
        isLoadingLanguages={isLoadingLanguages}
        onAddLanguage={handleAddLanguage}
        onEditLanguage={handleEditLanguage}
        onDeleteLanguage={handleDeleteLanguage}
      />
    </div>
  </div>
);

export default LanguageTab;
