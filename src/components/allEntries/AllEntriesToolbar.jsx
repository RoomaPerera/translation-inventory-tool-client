import React from 'react';
import { Select } from '../reusableComponents/Select'; // Using the reusable dropdown

const AllEntriesToolbar = () => {
    // Dummy options for now, can be populated from state/API later
    const productOptions = [{ value: 'rubix', label: 'Rubix' }];
    const langOptions = [{ value: 'all', label: 'All Languages' }];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-5 flex items-center">
            <div className="w-48 mr-4">
                <Select options={productOptions} selected={'rubix'} onSelect={() => {}} />
            </div>
            <div className="w-48 mr-4">
                <Select options={langOptions} selected={'all'} onSelect={() => {}} />
            </div>
        </div>
    );
};

export default AllEntriesToolbar;