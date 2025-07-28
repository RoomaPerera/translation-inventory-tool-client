import React from "react";
import { FaChartLine } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaList, FaClock, FaCog, FaSignOutAlt } from "react-icons/fa";
import gtnLogo from "../assets/images/gtn-logo.png";
import { useAuthContext } from "../hooks/useAuthContext";
import authService from "../services/authService"; // Import the service

const Sidebar = () => {
  const { user, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout service to clear the backend cookie
      await authService.logout();
    } catch (error) {
      console.error(
        "Logout failed on server, proceeding with client-side cleanup.",
        error
      );
    } finally {
      // Always perform client-side cleanup
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      navigate("/login"); // Redirect to login page
    }
  };

  // Role-based navigation visibility
  const shouldShowNavItem = (itemName) => {
    if (!user || !user.role) return false;
    
    const role = user.role.toLowerCase();
    
    switch (itemName) {
      case 'home':
        return true; // Home is visible to all roles
      case 'all-entries':
        return role === 'admin' || role === 'developer'; // Hidden for translators
         case 'analytics':
        return role === 'admin' || role === 'developer'; 
      case 'activity-log':
        return role === 'admin' || role === 'translator'; // Hidden for developers
      case 'settings':
        return true; // Settings is visible to all roles
      default:
        return false;
    }
  };

  return (
    <aside className="w-56 bg-gradient-to-b from-brand-purple-dark to-brand-cyan text-white flex flex-col p-5 shrink-0">
      <div className="flex items-center mb-8">
        <img src={gtnLogo} alt="GTN Logo" className="w-32 h-19 mr-1" />
        <h1 className="text-2xl font-bold"></h1>
      </div>

      <nav className="flex-grow">
        <ul>
          {shouldShowNavItem('home') && (
            <li className="mb-4">
              <Link
                to="/"
                className="flex items-center gap-4 py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light"
              >
                <FaHome /> Home
              </Link>
            </li>
          )}
          {shouldShowNavItem('all-entries') && (
            <li className="mb-4">
              <Link
                to="/all-entries"
                className="flex items-center gap-4 py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light"
              >
                <FaList /> All Entries
              </Link>
            </li>
          )}
        {shouldShowNavItem('analytics') && (
            <li className="mb-4">
                        <Link to="/analytics" className="flex items-center gap-4 py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light">
                            <FaChartLine /> Analytics
                        </Link>
                    </li>
          )}

          {shouldShowNavItem('activity-log') && (
            <li className="mb-4">
              <Link
                to="/activity-log"
                className="flex items-center gap-4 py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light"
              >
                <FaClock /> Activity Log
              </Link>
            </li>
          )}
          {shouldShowNavItem('settings') && (
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-4 py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light"
              >
                <FaCog /> Settings
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto border-t border-gray-500/50 pt-5">
        <p className="font-bold mb-1">{user ? user.userName : "Guest User"}</p>
        <p className="text-sm text-brand-purple-light mb-4 capitalize">
          {user ? user.role : "No Role"}
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-white/10 text-white rounded-lg cursor-pointer transition-colors hover:bg-brand-hover-light"
        >
          <FaSignOutAlt /> Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
