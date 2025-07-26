import React from 'react';
import { Select } from '../reusableComponents/Select';

const AllEntriesToolbar = ({
    projects,
    currentProjectId,
    onProjectChange
}) => {
    // Start with the "All Projects" option
    const projectOptions = [{ value: '', label: 'All Projects' }];

    // Add the fetched projects to the options array
    if (projects && projects.length > 0) {
        projects.forEach(p => {
            projectOptions.push({ value: p._id, label: p.name });
        });
    }

    const langOptions = [{ value: 'all', label: 'All Languages' }];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-5 flex items-center">
            {/* --- FIXED: Dynamic Project Selector --- */}
            <div className="w-48 mr-4">
                <Select
                    label="Project"
                    options={projectOptions}
                    selected={currentProjectId}
                    onSelect={onProjectChange}
                />
            </div>
            <div className="w-48 mr-4">
                <Select
                    label="Language"
                    options={langOptions}
                    selected={'all'}
                    onSelect={() => {}} // This can be wired up later if needed
                />
            </div>
        </div>
    );
};

export default AllEntriesToolbar;