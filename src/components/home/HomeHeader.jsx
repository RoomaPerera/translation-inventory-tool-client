import React from 'react';
import { SearchInput } from '../reusableComponents/SearchInput';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';

// Component now receives project-related props
const HomeHeader = ({
    searchTerm,
    onSearchChange,
    onAssignLanguageClick,
    projects,
    currentProjectId,
    onProjectChange
}) => {
    // Dynamically create options from the projects prop
    const projectOptions = projects.map(p => ({ value: p._id, label: p.name }));

    return (
        <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg shadow-sm mb-5">
            <div className="flex items-center gap-5">
                <h2 className="text-xl font-semibold">Translation Dashboard</h2>

                {/* --- FIXED: Project Selector Dropdown --- */}
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
            <div className="header-right">
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