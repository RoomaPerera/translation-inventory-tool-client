import React from 'react';
import ProjectCard from '../../components/ProjectLanguageComponents/ProjectCard';
import ProjectEmptyState from './ProjectEmptyState';

const ProjectGrid = ({
  isLoadingProjects,
  filteredProjects,
  handleEditProject,
  handleDeleteProject,
  searchTerm,
  filterBy,
  handleAddProject
}) => {
  if (isLoadingProjects) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin border-t-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }
  if (filteredProjects.length > 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProjects.map((project) => (
          <div key={project._id} className="hover:shadow-md transition-shadow duration-200">
            <ProjectCard
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              bgColor="bg-white"
              borderColor="border-gray-200"
              textColor="text-gray-800"
              editButtonColor="bg-indigo-600"
              editButtonHoverColor="hover:bg-indigo-700"
              deleteButtonColor="bg-red-600"
              deleteButtonHoverColor="hover:bg-red-700"
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <ProjectEmptyState
      searchTerm={searchTerm}
      filterBy={filterBy}
      handleAddProject={handleAddProject}
    />
  );
};

export default ProjectGrid;
