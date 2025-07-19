import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { ActivityLogProvider } from "./context/ActivityLogContext";
import Navbar from "./components/navBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ActivityLog from "./pages/ActivityLog";
import { useAuthContext } from "./hooks/useAuthContext";

function PrivateRoute({ children }) {
  const { user } = useAuthContext();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthContextProvider>
      <ActivityLogProvider>
        <Router>
          <Navbar />
          <div className="container mx-auto mt-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/activity-logs"
                element={
                  <PrivateRoute>
                    <ActivityLog />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ActivityLogProvider>
    </AuthContextProvider>
  );
}
