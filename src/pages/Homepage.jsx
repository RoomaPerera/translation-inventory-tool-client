// src/pages/Homepage.jsx

import React, { useEffect, useState } from 'react';
import NavBar from '../components/reusableComponents/NavBar';
import { PlusIcon } from '@heroicons/react/outline';

const Homepage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) {
    return <div className="p-8 text-center">Loading user info...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar NavBar */}
      <aside className="w-64">
        <NavBar user={user} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-gray-800">GTN Portal</div>
          <select className="border rounded p-2">
            <option>Rubix</option>
          </select>
          <input type="text" placeholder="Search..." className="border rounded p-2" />
          <button className="flex items-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            <PlusIcon className="w-5 h-5 mr-2" /> Assign New Language
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="flex items-center bg-white text-black px-4 py-2 rounded shadow">
            <PlusIcon className="w-5 h-5 mr-2" /> Add New Translation
          </button>
          <select className="border rounded p-2">
            <option>Show All Entries</option>
          </select>
          <select className="border rounded p-2">
            <option>All Languages</option>
          </select>
          <select className="border rounded p-2">
            <option>Translations</option>
          </select>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Download JSON</button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">No</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Key</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Language</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Translation</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2">1</td>
                <td className="px-4 py-2">ABOUT</td>
                <td className="px-4 py-2">EN</td>
                <td className="px-4 py-2">About</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white text-sm">Edit</button>
                  <button className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white text-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Homepage;
