import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import RoleBasedTabs from '../components/Tabs'; // adjust if you use named export
import UserProfile from '../components/UserProfile';

const ALL_TABS = [
  { name: 'User List', roles: ['Administrator'] },
  { name: 'New Project', roles: ['Administrator'] },
  { name: 'User Profile', roles: ['Administrator', 'Developer', 'Translator'] },
];

const Settings = () => {
  const [user, setUser] = useState({ name: 'WADRU Perera', role: 'Administrator' });
  const [activeTab, setActiveTab] = useState('User Profile');

  useEffect(() => {
    const isTabValid = ALL_TABS.some(
      (tab) => tab.name === activeTab && tab.roles.includes(user.role)
    );
    if (!isTabValid) {
      setActiveTab('User Profile');
    }
  }, [user, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'User List':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">User List</h2>
            <p>List all users here (only visible to Admins).</p>
            {/* TODO: Replace with user table */}
          </div>
        );
      case 'New Project':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <p>Form to add new projects (only visible to Admins).</p>
            {/* TODO: Add project creation form */}
          </div>
        );
      case 'User Profile':
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-700 via-blue-800 to-teal-500 text-white flex flex-col">
        <NavBar user={user} onLogout={() => console.log('Logged out')} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Role switch buttons for demo/testing */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <h1 className="text-3xl font-bold text-purple-700 mr-4">GTN Portal</h1>
          {['Administrator', 'Developer', 'Translator'].map((role) => (
            <button
              key={role}
              onClick={() => setUser((prev) => ({ ...prev, role }))}
              className={`rounded px-3 py-1 text-white ${
                user.role === role
                  ? role === 'Administrator'
                    ? 'bg-blue-600'
                    : role === 'Developer'
                    ? 'bg-green-600'
                    : 'bg-yellow-600'
                  : role === 'Administrator'
                  ? 'bg-blue-400 hover:bg-blue-500'
                  : role === 'Developer'
                  ? 'bg-green-400 hover:bg-green-500'
                  : 'bg-yellow-400 hover:bg-yellow-500'
              }`}
              type="button"
            >
              {role}
            </button>
          ))}
        </div>

        <p className="mb-6 font-semibold text-gray-700">
          Current Role: <span className="text-indigo-600">{user.role}</span>
        </p>

        {/* Tabs */}
        <RoleBasedTabs user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <section
          id={`tab-panel-${activeTab.replace(/\s+/g, '-').toLowerCase()}`}
          aria-labelledby={`tab-${activeTab.replace(/\s+/g, '-').toLowerCase()}`}
          role="tabpanel"
          className="mt-4 rounded-b-lg border border-t-0 bg-white p-6 shadow w-full max-w-5xl"
        >
          {renderTabContent()}
        </section>
      </main>
    </div>
  );
};

export default Settings;
