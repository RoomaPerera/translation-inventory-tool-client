import React from 'react';
import Button from '../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';

const HomeToolbar = ({ onAddNewTranslation }) => {
    // Dummy options for the dropdowns
    const showOptions = [{ value: 'all', label: 'Show All Entries' }];
    const langOptions = [{ value: 'all', label: 'All Languages' }];
    const typeOptions = [{ value: 'translations', label: 'Translations' }]; // For the restored dropdown

    return (
        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-5">
            <Button
                onClick={onAddNewTranslation}
                className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3 mr-4"
            >
                + Add new Translation
            </Button>

            {/* Existing Dropdowns */}
            <div className="w-48 mr-4">
                <Select options={showOptions} selected={'all'} onSelect={() => { }} />
            </div>
            <div className="w-48 mr-4">
                <Select options={langOptions} selected={'all'} onSelect={() => { }} />
            </div>

            {/* === THE MISSING 'TRANSLATIONS' DROPDOWN IS NOW RESTORED HERE === */}
            <div className="w-48 mr-4">
                <Select options={typeOptions} selected={'translations'} onSelect={() => { }} />
            </div>

            <Button className="bg-gray-100 !text-gray-800 border border-gray-300 hover:bg-gray-200 !py-2 !px-3">
                Download
            </Button>

            {/* === THE MISSING RADIO BUTTONS ARE NOW RESTORED HERE === */}
            <div className="flex items-center ml-auto"> {/* Use ml-auto to push to the right */}
                <input type="radio" id="json" name="format" value="JSON" className="mr-1.5 h-4 w-4 accent-brand-purple-base" defaultChecked />
                <label htmlFor="json" className="mr-4 text-sm text-gray-700">JSON Format</label>

                <input type="radio" id="csv" name="format" value="CSV" className="mr-1.5 h-4 w-4 accent-brand-purple-base" />
                <label htmlFor="csv" className="text-sm text-gray-700">CSV</label>
            </div>
        </div>
    );
};

export default HomeToolbar;