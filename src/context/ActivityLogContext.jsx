import { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { fetchActivityLogs } from "../services/activityLogApi";

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getActivityLogs = async (filters = {}) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      let response;
      if (user.role === "Admin") {
        response = await fetchActivityLogs(filters);
      } else {
        response = await fetchActivityLogs(); // No filters for Translator
      }
      if (response && response.error) {
        setError(response.error);
        setLogs([]);
        return;
      }
      if (Array.isArray(response)) {
        setLogs(response);
      } else {
        setError("Failed to fetch activity logs - unexpected response format");
      }
    } catch (err) {
      setError(
        err.message || "Failed to fetch activity logs. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const value = {
    logs,
    loading,
    error,
    getActivityLogs,
    userRole: user?.role,
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error(
      "useActivityLog must be used within an ActivityLogProvider"
    );
  }
  return context;
};
