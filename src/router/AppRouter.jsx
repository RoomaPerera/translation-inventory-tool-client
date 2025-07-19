// src/router/AppRouter.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Homepage from '../pages/Homepage';
import LoginPage from '../pages/login';
import Registration from '../pages/registration';
import ForgotPassword from '../pages/ForgotPassword';
// import ResetPassword from '../pages/ResetPassword';
import Settings from '../pages/Settings';
import ButtonDemo from '../pages/ButtonDemo';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminPage from '../pages/AdminPage'; // Make sure this import exists

const NotFound = () => (
  <div className="p-8 text-center text-2xl">404 - Page Not Found</div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  const navigate = useNavigate();
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
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage setUser={setUser} />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
      <Route path="/button-demo" element={<ButtonDemo />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Homepage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
