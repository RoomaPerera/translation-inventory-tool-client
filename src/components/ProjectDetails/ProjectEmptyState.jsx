import React from 'react';

const ProjectEmptyState = ({ searchTerm, filterBy, handleAddProject }) => (
  <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
    <div className="max-w-md mx-auto">
      <svg className="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {searchTerm || filterBy !== 'all' ? 'No projects match your criteria' : 'No projects yet'}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchTerm || filterBy !== 'all' 
          ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
          : 'Get started by creating your first translation project!'}
      </p>
      {(!searchTerm && filterBy === 'all') && (
        <button 
          onClick={handleAddProject}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Project
        </button>
      )}
    </div>
  </div>
);

export default ProjectEmptyState;
