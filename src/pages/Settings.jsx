import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import ProjectAndLanguageSettings from './ProjectAndLanguageSettings';
import UserProfile from '../components/UserProfile';
import ReadabilityValidator from '../components/ReadabilityValidator'; // Import from final-2
import UserSettings from '../components/UserListComponents/UserSettings';

const Settings = () => {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('profile');

    // Check if user is admin
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <main className="flex-grow p-5 bg-brand-bg-main min-h-screen">
            <div className="max-w-full">
                <h1 className="text-3xl font-bold mb-6 text-indigo-800">Settings</h1>

                <div className="flex mb-6 border-b border-gray-200">
                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${activeTab === 'profile'
                            ? 'text-indigo-700 border-indigo-700 bg-white'
                            : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        User Profile
                    </button>
                    
                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${activeTab === 'management'
                            ? 'text-indigo-700 border-indigo-700 bg-white'
                            : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('management')}
                    >
                        Project & Language Management
                    </button>

                    {/* ReadabilityValidator Tab - from final-2 */}
                    <button
                        className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${activeTab === 'readability'
                            ? 'text-indigo-700 border-indigo-700 bg-white'
                            : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('readability')}
                    >
                        Readability Validator
                    </button>

                    {/* Admin-only User Management Tab - from final-3 */}
                    {isAdmin && (
                        <button
                            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${activeTab === 'users'
                                ? 'text-indigo-700 border-indigo-700 bg-white'
                                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('users')}
                        >
                            User Management
                        </button>
                    )}
                </div>

                {/* Tab Contents */}
                
                {/* User Profile Section - Enhanced version from final-3 */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                View and manage your account information and preferences.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={user?.userName || ''}
                                        readOnly
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={user?.role || ''}
                                        readOnly
                                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 capitalize focus:outline-none"
                                    />
                                </div>

                                {user?.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 focus:outline-none"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Account Status</label>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user?.isActive === true
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${user?.isActive === true ? 'bg-green-400' : 'bg-red-400'
                                                }`}></span>
                                            {user?.isActive === true ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Account Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                        Change Password
                                    </button>
                                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Include the original UserProfile component as well for any additional functionality */}
                        <div className="mt-6 border-t pt-6">
                            <UserProfile />
                        </div>
                    </div>
                )}

                {/* Project & Language Management Section */}
                {activeTab === 'management' && (
                    <div>
                        <ProjectAndLanguageSettings />
                    </div>
                )}

                {/* ReadabilityValidator Section - from final-2 */}
                {activeTab === 'readability' && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Readability Validator</h2>
                        <p className="text-gray-600 mb-6">
                            Validate and analyze the readability of your translations.
                        </p>
                        <ReadabilityValidator />
                    </div>
                )}

                {/* Admin-only User Management Section - from final-3 */}
                {activeTab === 'users' && isAdmin && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">User Management</h2>
                        <p className="text-gray-600 mb-6">
                            Manage user accounts, roles, and permissions.
                        </p>
                        <UserSettings />
                    </div>
                )}
            </div>
        </main>
    );
};

export default Settings;