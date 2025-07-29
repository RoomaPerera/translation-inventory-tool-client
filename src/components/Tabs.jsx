import React, { useState, useMemo } from 'react';

// Define all possible tabs and the roles that can see them
const ALL_TABS = [
  { name: 'User List', roles: ['Admin'] },
  { name: 'New Project', roles: ['Admin'] },
  { name: 'User Profile', roles: ['Admin', 'Developer', 'Translator'] },
];

// Props:
// - user: An object containing the user's role, e.g., { role: 'Administrator' }
// - activeTab: The state for the currently active tab name
// - setActiveTab: The function to update the active tab state
export const RoleBasedTabs = ({ user, activeTab, setActiveTab }) => {
  // Memoize the filtering logic so it only runs when the user's role changes
  const visibleTabs = useMemo(() => 
    ALL_TABS.filter(tab => tab.roles.includes(user?.role || ''))
  , [user]);

  return (
    <nav className="flex rounded-[5px] overflow-hidden border border-gray-200" aria-label="Tabs">
      {visibleTabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`px-4 py-2 md:px-6 md:py-3 w-full max-w-full text-base font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75
            ${
              activeTab === tab.name
                ? 'bg-[#553A99]'
                : 'bg-[#A295C8] hover:bg-indigo-500'
            }
          `}
          
          
          role="tab"
          aria-selected={activeTab === tab.name}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

// --- Example of how to use this component in a parent page ---

export const SettingsPageWithTabs = () => {
  // Simulate user data and role changes
  const [user, setUser] = useState({ role: 'Administrator' });
  const [activeTab, setActiveTab] = useState('User Profile');
  
  // When the user role changes, we must ensure the activeTab is still valid
  React.useEffect(() => {
    const isTabVisibleForNewRole = ALL_TABS.find(tab => tab.name === activeTab)?.roles.includes(user.role);
    if (!isTabVisibleForNewRole) {
      // If the current active tab is no longer visible, default to 'User Profile'
      setActiveTab('User Profile');
    }
  }, [user, activeTab]);

  return (
    <div className="w-full p-8 bg-gray-100">
      {/* Demo buttons to change the user role */}
      <div className="mb-4 flex space-x-2">
        <button onClick={() => setUser({ role: 'Administrator' })} className="rounded bg-blue-500 px-3 py-1 text-white">Set as Admin</button>
        <button onClick={() => setUser({ role: 'Developer' })} className="rounded bg-green-500 px-3 py-1 text-white">Set as Developer</button>
        <button onClick={() => setUser({ role: 'Translator' })} className="rounded bg-yellow-500 px-3 py-1 text-white">Set as Translator</button>
      </div>
      <p className="mb-2 font-medium">Current Role: <span className="font-bold text-indigo-600">{user.role}</span></p>

      {/* Render the RoleBasedTabs component */}
      <RoleBasedTabs user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Render content based on the active tab */}
      <div className="mt-4 rounded-b-lg border bg-white p-6">
        <h2 className="text-xl font-bold">Content for: {activeTab}</h2>
        <p>This is where the content for the selected tab would be displayed.</p>
      </div>
    </div>
  );
}; 

export default RoleBasedTabs; 