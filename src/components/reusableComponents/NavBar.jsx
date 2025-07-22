import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { name: 'Home', to: '/', roles: ['Administrator', 'Developer', 'Translator'] },
  { name: 'All Entries', to: '/entries', roles: ['Administrator', 'Developer'] },
  { name: 'Activity Log', to: '/activity', roles: ['Administrator', 'Translator'] },
  { name: 'Settings', to: '/settings', roles: ['Administrator', 'Developer', 'Translator'] },
  { name: 'Readability Validator', to: '/tools/readability-validator', roles: ['Administrator', 'Developer'] },

];

const NavBar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[250px] bg-gradient-to-b from-[#553A99] via-[#5B63B7] to-[#4FB6B2] text-white flex flex-col justify-between shadow-md font-sans">

      {/* Logo and Portal Label */}
      <div className="flex flex-col items-center p-4">
        <img src="/GTN Logo 3.png" alt="GTN Logo" className="h-20 w-auto" />
        <span className="font-bold text-xl mt-2">GTN Portal</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {user ? (
          navLinks
            .filter(link => link.roles.includes(user.role))
            .map(link => (
              <Link
                key={link.name}
                to={link.to}
                className={`block px-4 py-2 rounded-md transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))
        ) : (
          <p className="text-center text-white/70">No user logged in</p>
        )}
      </nav>

      {/* User Info & Logout Button */}
      {user && (
        <div className="p-4 border-t border-white/30">
          <div className="mb-2">
            <div className="font-semibold">{user.userName || 'User Name'}</div>
            <div className="text-white/80 text-sm">{user.email || 'user@email.com'}</div>
            <div className="text-white/70 text-xs italic">{user.role || 'Role'}</div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full px-4 py-2 rounded-md bg-white/40 text-white font-semibold hover:bg-white/60 transition"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
