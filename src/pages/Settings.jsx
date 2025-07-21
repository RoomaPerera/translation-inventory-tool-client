import React from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

const Settings = () => {
  const { user } = useAuthContext();
  return (
    <main className="flex-grow p-5 bg-brand-bg-main min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
         <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800">User Profile</h3>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <input type="text" value={user?.userName || ''} readOnly className="mt-1 p-2 w-full max-w-sm bg-gray-100 border border-gray-300 rounded-md" />
            </div>
             <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <input type="text" value={user?.role || ''} readOnly className="mt-1 p-2 w-full max-w-sm bg-gray-100 border border-gray-300 rounded-md capitalize" />
            </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;