import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'projects', label: 'Project Management' },
    { id: 'languages', label: 'Language Management' },
    { id: 'quick-actions', label: 'Quick Actions' }
  ];

  return (
    <div className="flex mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
            activeTab === tab.id
              ? 'text-indigo-700 border-indigo-700 bg-white'
              : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
