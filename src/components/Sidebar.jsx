import React from 'react';
import { HomeIcon, CollectionIcon, DocumentReportIcon, CogIcon, LogoutIcon } from '@heroicons/react/outline';

// Define the navigation links
const navLinks = [
  { name: 'Home', href: '#', icon: HomeIcon, roles: ['Administrator', 'Developer'] },
  { name: 'All Entries', href: '#', icon: CollectionIcon, roles: ['Administrator', 'Developer'] },
  { name: 'Activity Log', href: '#', icon: DocumentReportIcon, roles: ['Administrator'] }, // Admin only
  { name: 'Settings', href: '#', icon: CogIcon, roles: ['Administrator', 'Developer'] },
];

// Props:
// - user: An object with user details, e.g., { name: 'WADRU Perera', role: 'Administrator' }
export const Sidebar = ({ user }) => {
  const activeLink = 'Home'; // In a real app, this would come from a router

  return (
    <div className="flex h-screen w-72 flex-col justify-between bg-gradient-to-b from-indigo-700 via-blue-800 to-teal-500 p-6 text-white">
      {/* Top section: Logo and Nav Links */}
      <div>
        <div className="mb-12 flex items-center justify-center">
          <img className="h-16" src="https://i.imgur.com/sC44B1A.png" alt="GTN Logo" />
        </div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              link.roles.includes(user.role) && (
                <li key={link.name} className="mb-2">
                  <a
                    href={link.href}
                    className={`flex items-center space-x-3 rounded-md p-3 text-lg font-medium transition-colors
                      ${
                        activeLink === link.name
                          ? 'bg-white/15 font-semibold'
                          : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <link.icon className="h-6 w-6" />
                    <span>{link.name}</span>
                  </a>
                </li>
              )
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom section: User Profile and Logout */}
      <div>
        <div className="mb-4">
          <p className="font-bold">{user.name}</p>
          <p className="text-sm text-indigo-200">{user.role}</p>
        </div>
        <button className="flex w-full items-center justify-center space-x-3 rounded-md bg-white/80 py-3 font-semibold text-gray-800 transition-colors hover:bg-white">
          <LogoutIcon className="h-6 w-6" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}; 