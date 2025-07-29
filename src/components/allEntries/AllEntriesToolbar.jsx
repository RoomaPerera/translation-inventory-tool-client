import React from 'react';
import { Select } from '../reusableComponents/Select';
import { useLanguages } from '../../hooks/useLanguages';

const AllEntriesToolbar = ({
    projects,
    currentProjectId,
    onProjectChange,
    currentLanguage,
    onLanguageChange
}) => {
    const { languages, loading: languagesLoading } = useLanguages();

    // Start with the "All Projects" option
    const projectOptions = [{ value: '', label: 'All Projects' }];

    // Add the fetched projects to the options array
    if (projects && projects.length > 0) {
        projects.forEach(p => {
            projectOptions.push({ value: p._id, label: p.name });
        });
    }

    // Create dynamic language options
    const langOptions = [{ value: 'all', label: 'All Languages' }];
    if (languages && languages.length > 0) {
        languages.forEach(lang => {
            langOptions.push({ 
                value: lang.code, 
                label: `${lang.name} (${lang.code})` 
            });
        });
    }

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
                    selected={currentLanguage || 'all'}
                    onSelect={onLanguageChange}
                    disabled={languagesLoading}
                    placeholder={languagesLoading ? "Loading languages..." : "Select Language"}
                />
            </div>
        </div>
    );
};

export default AllEntriesToolbar;