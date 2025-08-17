import React from 'react';

const ProjectDetailsHeader = ({ navigate, stats }) => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    {/* Title and Navigation */}
    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        title="Go Back"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Project Details</h1>
        <p className="text-gray-600 mt-1">Manage and organize your translation projects</p>
      </div>
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-blue-800">{stats.total}</div>
          <div className="text-xs text-blue-600">Total</div>
        </div>
      </div>
      <div className="bg-teal-50 p-3 rounded-lg border border-teal-200 hover:shadow-md transition-shadow duration-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-teal-800">{stats.withLanguages}</div>
          <div className="text-xs text-teal-600">Active</div>
        </div>
      </div>
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 hover:shadow-md transition-shadow duration-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-amber-800">{stats.withoutLanguages}</div>
          <div className="text-xs text-amber-600">Pending</div>
        </div>
      </div>
      <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 hover:shadow-md transition-shadow duration-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800">{stats.filtered}</div>
          <div className="text-xs text-gray-600">Showing</div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectDetailsHeader;
