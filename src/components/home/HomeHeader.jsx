import React from 'react';
import { SearchInput } from '../reusableComponents/SearchInput';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select'; // Import the reusable Select

const HomeHeader = ({ projects = [], selectedProject, onProjectSelect, onAssignLanguageClick, loading = false }) => {
    // Transform projects into the format expected by the Select component
    const projectOptions = projects.length > 0 
        ? projects.map(project => ({
            value: project._id,
            label: project.name
          }))
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
            <div className="flex items-center gap-5"> {/* Added gap for spacing */}
                <h2 className="text-xl font-semibold">Translation Dashboard</h2>

                {/* Project Selection Dropdown */}
                <div className="w-48 min-w-[12rem]">
                    <Select 
                        options={projectOptions} 
                        selected={selectedProject?._id || projectOptions[0]?.value} 
                        onSelect={handleProjectSelect}
                        disabled={projects.length === 0 || loading}
                    />
                </div>

                <div className="w-64">
                    <SearchInput placeholder="Search Keys or Words..." />
                </div>
            </div>
            <div className="header-right">
                <Button
                    onClick={onAssignLanguageClick}
                    className="bg-brand-purple-base hover:bg-purple-700 text-white !py-2.5 !px-4"
                >
                    + Assign New Language
                </Button>
            </div>
        </div>
    );
};

export default HomeHeader;