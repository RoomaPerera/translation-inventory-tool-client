import React, { useState } from 'react';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';
import { useLanguages } from '../../hooks/useLanguages';

const HomeToolbar = ({ user, filters, onFilterChange, onAddNewTranslation, onDownloadTranslations }) => {
    const { languages, loading: languagesLoading } = useLanguages();
    const [downloadFormat, setDownloadFormat] = useState('json'); // State for radio button selection
    const [isDownloading, setIsDownloading] = useState(false);

    // Create dynamic language options from fetched languages
    const langOptions = [
        { value: '', label: 'All Languages' },
        ...languages.map(lang => ({
            value: lang.code,
            label: `${lang.name} (${lang.code.toUpperCase()})`
        }))
    ];

    const showOptions = [
        { value: 'all', label: 'Show All Entries' },
        { value: 'pending', label: 'Pending Translations' },
        { value: 'approved', label: 'Approved Translations' }
    ];

    const typeOptions = [{ value: 'translations', label: 'Translations' }];

    // Handle download button click
    const handleDownload = async () => {
        if (!filters.projectId) {
            alert('Please select a project first.');
            return;
        }

        setIsDownloading(true);
        try {
            await onDownloadTranslations(downloadFormat, filters);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download translations. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            {/* Only show Add New Translation button for Admin and Developer */}
            {user && (user.role === 'Admin' || user.role === 'Developer') && (
                <Button
                    onClick={onAddNewTranslation}
                    className="bg-brand-purple-base hover:bg-brand-purple-dark text-white"
                >
                    + Add new Translation
                </Button>
            )}

            <div className="flex flex-wrap items-center gap-4">
                <Select
                    options={typeOptions}
                    value="translations"
                    placeholder="Type"
                    onChange={() => {}}
                />

                <Select
                    options={showOptions}
                    value={filters.status}
                    placeholder="Show"
                    onChange={(value) => onFilterChange('status', value)}
                />

                <Select
                    options={langOptions}
                    value={filters.language}
                    placeholder="Language"
                    onChange={(value) => onFilterChange('language', value)}
                    disabled={languagesLoading}
                />

                {/* Only show Download button and JSON/CSV radio buttons for Admin and Developer */}
                {user && (user.role === 'Admin' || user.role === 'Developer') && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="downloadFormat"
                                    value="json"
                                    checked={downloadFormat === 'json'}
                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                    className="text-brand-purple-base"
                                />
                                <span className="text-sm">JSON</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="downloadFormat"
                                    value="csv"
                                    checked={downloadFormat === 'csv'}
                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                    className="text-brand-purple-base"
                                />
                                <span className="text-sm">CSV</span>
                            </label>
                        </div>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeToolbar;