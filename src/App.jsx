import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuthContext } from "./hooks/useAuthContext";
import ProtectedLayout from "./components/ProtectedLayout";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Home from "./pages/Home";
import AllEntries from "./pages/AllEntries";
import ActivityLog from "./pages/ActivityLog";
import Settings from "./pages/Settings";
import { ActivityLogProvider } from "./context/ActivityLogContext";

function App() {
  const { authReady } = useAuthContext();

  // Prevent route flicker while checking auth state
  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/all-entries" element={<AllEntries />} />

          <Route
            path="/activity-log"
            element={
              <ActivityLogProvider>
                <ActivityLog />
              </ActivityLogProvider>
            }
          />

          <Route path="/settings" element={<Settings />} />
          {/* Redirect unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
