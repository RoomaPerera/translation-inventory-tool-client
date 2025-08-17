import React from 'react';
import FuzzySearchInput from '../../components/reusableComponents/FuzzySearchInput';

const ProjectActionBar = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  handleAddProject
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1 lg:max-w-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <FuzzySearchInput
            placeholder="Search projects..."
            searchType="project"
            onQueryChange={setSearchTerm}
            onResultSelect={(result) => {
              setSearchTerm(result.displayValue || result.product || result.matchedField);
            }}
            className="w-full"
          />
        </div>
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="most-languages">Most Languages</option>
        </select>
        {/* Filter Dropdown */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="all">All Projects</option>
          <option value="with-languages">With Languages</option>
          <option value="without-languages">Without Languages</option>
        </select>
      </div>
      {/* Add Project Button */}
      <button
        onClick={handleAddProject}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
);

export default ProjectActionBar;
