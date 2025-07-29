import React, { useState } from 'react';
import ProjectCard from './ProjectCard';

const ProjectManagement = ({
  projects,
  isLoadingProjects,
  onAddProject,
  onEditProject,
  onDeleteProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects
    .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
    .filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-white rounded-md shadow p-4 mb-6">
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <button
          onClick={onAddProject}
          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Project
        </button>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded text-sm w-48"
        />
      </div>

      {isLoadingProjects ? (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
              disableHover={true} // optionally pass to reduce effects inside ProjectCard
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8 border border-dashed rounded">
          <p className="text-sm mb-2">
            {searchTerm ? 'No matching projects.' : 'No projects found.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddProject}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
            >
              Create Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
