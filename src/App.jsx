import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

// Import Layout Component
import Sidebar from './components/Sidebar';

// Import All Pages
import Home from './pages/Home';
import AllEntries from './pages/AllEntries';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import Login from './pages/login';
import Register from './pages/Register';

function App() {
  const { user } = useAuthContext();

  return (
    <Router>
      <Routes>
        {/* Public routes only accessible when logged out */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected routes that use the Sidebar layout */}
        {/* All paths under "/*" will be checked for authentication */}
        <Route
          path="/*"
          element={
            user ? (
              // If logged in, render the dashboard layout
              <div className="flex h-screen bg-brand-bg-main overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  {/* Nested routes define the content of the main area */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/all-entries" element={<AllEntries />} />
                    <Route path="/activity-log" element={<ActivityLog />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Catch-all for any other authenticated path */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              // If not logged in, redirect any other path to the login page
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;