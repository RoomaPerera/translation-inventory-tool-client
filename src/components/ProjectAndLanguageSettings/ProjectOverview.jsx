import React from 'react';

const ProjectOverview = ({ stats, handleAddProject, handleViewProjectDetails, isLoadingProjects }) => (
  <div>
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h1 className="text-xl font-semibold text-gray-800">Project Overview</h1>
      </div>
      <p className="text-gray-600">
        Manage your translation projects and access detailed project information
      </p>
    </div>
    <div className="grid gap-6">
      {/* Add Project Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Create New Project</span>
            </h3>
            <p className="text-gray-600">Start a new translation project with custom settings</p>
          </div>
          <button
            onClick={handleAddProject}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Project</span>
            </span>
          </button>
        </div>
      </div>
      {/* Your Projects Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span>Your Projects</span>
            </h3>
            <p className="text-gray-600">
              View and manage all your projects ({stats.totalProjects} total)
            </p>
            {stats.totalProjects > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                  {stats.projectsWithLanguages} Active
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleViewProjectDetails}
            disabled={isLoadingProjects}
            className="px-6 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{isLoadingProjects ? 'Loading...' : 'View Projects'}</span>
            </span>
          </button>
        </div>
      </div>
      {/* Quick Stats */}
      {stats.totalProjects > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span>Project Statistics</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalProjects}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.projectsWithLanguages}</div>
              <div className="text-sm text-gray-600">With Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLanguages}</div>
              <div className="text-sm text-gray-600">Available Languages</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ProjectOverview;
