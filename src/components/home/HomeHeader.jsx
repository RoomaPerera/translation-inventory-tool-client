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
  projects,
  currentProjectId,
  onProjectChange,
}) => {
  const projectOptions = projects.map((p) => ({ value: p._id, label: p.name }));

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
        <Button
          onClick={onAssignLanguageClick}
          className="bg-brand-purple-base hover:bg-opacity-80 text-white !py-2.5 !px-4"
        >
          + Assign New Language
        </Button>
      </div>
    </div>
  );
};

export default HomeHeader;
