import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import ProjectAndLanguageSettings from './ProjectAndLanguageSettings';
import UserProfile from '../components/UserProfile';
// import ReadabilityValidator from '../components/ReadabilityValidator'; // Import this

const Settings = () => {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <main className="flex-grow p-5 bg-brand-bg-main min-h-screen">
            <div className="max-w-full">
                <h1 className="text-3xl font-bold mb-6 text-indigo-800">Settings</h1>
                
                <div className="flex mb-6 border-b border-gray-200">
                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
                            activeTab === 'profile'
                                ? 'text-indigo-700 border-indigo-700 bg-white'
                                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        User Profile
                    </button>
                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
                            activeTab === 'management'
                                ? 'text-indigo-700 border-indigo-700 bg-white'
                                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('management')}
                    >
                        Project & Language Management
                    </button>

                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
                            activeTab === 'readability'
                                ? 'text-indigo-700 border-indigo-700 bg-white'
                                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('readability')}
                    >
                        ReadabilityValidator
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'profile' && <UserProfile />}
                {activeTab === 'management' && <ProjectAndLanguageSettings />}
                {activeTab === 'readability' && <ReadabilityValidator />}
            </div>
        </main>
    );
};

export default Settings;
