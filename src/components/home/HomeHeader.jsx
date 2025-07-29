import React from "react";
import { SearchInput } from "../reusableComponents/SearchInput";
import Button from "../reusableComponents/Button";
import { Select } from "../reusableComponents/Select";

const HomeHeader = ({
    user, // <-- 1. Receive the user object as a prop
    searchTerm,
    onSearchChange,
    onAssignLanguageClick,
    onAnomalyDashboardClick,
    projects = [],
    currentProjectId,
    onProjectChange,
    selectedProject,
    onProjectSelect,
    loading = false,
}) => {
    const projectOptions = projects.length > 0 
        ? projects.map(p => ({ value: p._id, label: p.name }))
        : loading 
        ? [{ value: 'loading', label: 'Loading projects...' }]
        : [{ value: 'no-projects', label: 'No projects available' }];

    // Handle project selection from dropdown
    const handleProjectSelect = (selectedValue) => {
        if (selectedValue === 'no-projects' || selectedValue === 'loading') return;
        
        const project = projects.find(p => p._id === selectedValue);
        if (project && onProjectSelect) {
            onProjectSelect(project);
        }
    };

  return (
    <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg shadow-sm mb-5">
      <div className="flex items-center gap-5">
        <h2 className="text-xl font-semibold">Translation Dashboard</h2>
        <div className="w-68">
          <Select
            /*label="Project"*/
            options={projectOptions}
            selected={currentProjectId}
            onSelect={onProjectChange}
            disabled={projects.length === 0 || loading}
          />
        </div>
        <div className="w-64">
          <SearchInput
            placeholder="Search by Key..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>
      <div className="flex items-center">
        {/* --- 2. Conditionally render the button --- */}
        {user && (user.role === "Admin" || user.role === "admin") && (
          <Button
            onClick={onAnomalyDashboardClick}
            className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2.5 !px-4 mr-4"
          >
            Anomaly Dashboard
          </Button>
        )}
        {/* Only show Assign New Language button for Admin */}
        {user && user.role === "Admin" && (
          <Button
            onClick={onAssignLanguageClick}
            disabled={!currentProjectId}
            className={`hover:bg-opacity-80 text-white !py-2.5 !px-4 ${
              currentProjectId
                ? "bg-brand-purple-base"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            + Assign New Language
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;
