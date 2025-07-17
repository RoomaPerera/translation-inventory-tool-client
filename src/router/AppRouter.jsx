import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/login';
import Registration from '../pages/Registration';
import ButtonDemo from '../pages/ButtonDemo';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Homepage from '../pages/Homepage';
import Settings from '../pages/Settings';  // Import Settings page

const NotFound = () => (
  <div className="p-8 text-center text-2xl">404 - Page Not Found</div>
);

const AppRouter = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/button-demo" element={<ButtonDemo />} />
      <Route path="/settings" element={<Settings />} />   {/* Added Settings route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
