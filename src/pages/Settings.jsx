import React, { useState, useEffect } from 'react';
import NavBar from '../components/reusableComponents/NavBar';
import RoleBasedTabs from '../components/Tabs'; // Adjust if using named export
import UserProfile from '../components/UserProfile';
import GTNPortal from '../components/reusableComponents/GTNPortal';

const ALL_TABS = [
  { name: 'User List', roles: ['Admin'] },
  { name: 'New Project', roles: ['Admin'] },
  { name: 'User Profile', roles: ['Admin', 'Developer', 'Translator'] },
];

const Settings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('User Profile');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
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
          </div>
        );
      case 'New Project':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <p>Form to add new projects (only visible to Admins).</p>
          </div>
        );
      case 'User Profile':
      default:
        return <UserProfile />;
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading user info...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64">
        <NavBar
          user={user}
          onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
          }}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Testing Role Switch Buttons */}
        <GTNPortal
        
        />

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
          className="mt-4 rounded-b-lg border border-t-0 bg-white p-6 shadow w-full max-w-full"
        >
          {renderTabContent()}
        </section>
      </main>
    </div>
  );
};

export default Settings;
