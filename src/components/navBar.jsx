import { TranslateIcon } from '@heroicons/react/outline';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Example user prop: { name: 'WADRU Perera', role: 'Administrator' }
const navLinks = [
  { name: 'Home', to: '/', roles: ['Administrator', 'Developer','Translater'] },
  { name: 'All Entries', to: '/entries', roles: ['Administrator', 'Developer'] },
  { name: 'Activity Log', to: '/activity', roles: ['Administrator','Translater'] },
  { name: 'Settings', to: '/settings', roles: ['Administrator', 'Developer','Translater'] },
];

export const NavBar = (props) => {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-blue-800 to-teal-500 px-6 py-3 flex items-center justify-between shadow">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img src="https://i.imgur.com/sC44B1A.png" alt="GTN Logo" className="h-10" />
        <span className="text-white font-bold text-xl">GTN Portal</span>
      </div>
      {/* Navigation Links */}
      <ul className="flex space-x-6">
        {navLinks.map(
          (link) =>
            link.roles.includes(props.user.role) && (
              <li key={link.name}>
                <Link
                  to={link.to}
                  className={`text-lg font-medium px-3 py-2 rounded transition-colors ${
                    location.pathname === link.to
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            )
        )}
      </ul>
      {/* User Profile & Logout */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-white font-bold">{props.user.name}</div>
          <div className="text-indigo-200 text-sm">{props.user.role}</div>
        </div>
        <button
          onClick={props.onLogout}
          className="ml-4 px-4 py-2 rounded bg-white/80 text-gray-800 font-semibold hover:bg-white transition"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 