import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/login';
import Registration from '../pages/Registration';
import ButtonDemo from '../pages/ButtonDemo';

const NotFound = () => (
  <div className="p-8 text-center text-2xl">404 - Page Not Found</div>
);

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/button-demo" element={<ButtonDemo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;