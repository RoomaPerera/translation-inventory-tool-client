import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Login from '../pages/login';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { name: 'Home', to: '/', roles: ['Administrator', 'Developer', 'Translator'] },
  { name: 'All Entries', to: '/entries', roles: ['Administrator', 'Developer'] },
  { name: 'Activity Log', to: '/activity', roles: ['Administrator', 'Translator'] },
  { name: 'Settings', to: '/settings', roles: ['Administrator', 'Developer', 'Translator'] },
];



export const NavBar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () =>{
    props.onLogout();
    navigate('/login');
  }

  return (
    <div className="flex flex-col justify-between h-full w-full bg-gradient-to-b from-indigo-700 via-blue-800 to-teal-500 text-white">
      {/* Logo with label */}
      <div className="flex flex-col space-x-2">
        <img src="/GTN Logo 3.png" alt="GTN Logo" className="h-50 w-auto"
         />
        <span className="font-bold text-2xl text-white text-center">GTN Portal</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navLinks.map(
          (link) =>
            link.roles.includes(props.user.role) && (
              <Link
                key={link.name}
                to={link.to}
                className={`block px-4 py-2 rounded transition-colors ${
                  location.pathname === link.to
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
        )}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-indigo-600">
        <div className="mb-2">
          <div className="text-white font-bold">{props.user.name}</div>
          <div className="text-indigo-200 text-sm">{props.user.role}</div>
        </div>
        <button

          onClick={handleLogout}
          className="w-full px-4 py-2 rounded bg-white/80 text-gray-800 font-semibold hover:bg-white transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default NavBar;