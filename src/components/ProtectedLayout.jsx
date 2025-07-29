// src/components/ProtectedLayout.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Sidebar from "./Sidebar";

export default function ProtectedLayout() {
  const { user, authReady } = useAuthContext();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl text-gray-600">Authenticating...</span>
      </div>
    );
  }

  // if not logged in, kick them to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // otherwise render the dashboard shell + whatever child route is active
  return (
    <div className="flex h-screen bg-brand-bg-main">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
