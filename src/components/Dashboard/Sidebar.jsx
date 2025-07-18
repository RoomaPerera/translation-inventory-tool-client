import React from 'react';
import gtnLogo from '../../assets/images/gtn-logo.png';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-brand-purple-dark to-brand-cyan text-white flex flex-col p-5 shrink-0">
      
      <div className="flex items-center mb-8">
        <img src={gtnLogo} alt="GTN Logo" className="w-12 h-12 mr-4" />
        <h1 className="text-2xl font-bold">GTN</h1>
      </div>
      
      <nav className="flex-grow">
        <ul>
          {/* Example of an "active" link. In a real app, you'd use a library like React Router for this. */}
          <li className="mb-4">
            <a href="#home" className="block py-3 px-5 rounded-lg text-base transition-colors bg-brand-hover-light">Home</a>
          </li>
          <li className="mb-4">
            <a href="#all-entries" className="block py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light">All Entries</a>
          </li>
          <li className="mb-4">
            <a href="#activity-log" className="block py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light">Activity Log</a>
          </li>
          <li>
            <a href="#settings" className="block py-3 px-5 rounded-lg text-base transition-colors hover:bg-brand-hover-light">Settings</a>
          </li>
        </ul>
      </nav>
      
      <div className="mt-auto border-t border-brand-purple-dark pt-5">
        <p className="font-bold mb-1">WADRU Perera</p>
        <p className="text-sm text-brand-purple-light mb-4">Administrator</p>
        <button className="w-full p-2.5 bg-brand-purple-dark text-white rounded-lg cursor-pointer transition-colors hover:bg-brand-hover-light">
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;