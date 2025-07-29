import { createContext, useContext, useState } from "react";
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
        response = await fetchActivityLogs(filters); // Pass filters for Translator too
      }

      // Handle axios response structure
      if (response && response.error) {
        setError(response.error);
        setLogs([]);
        return;
      }

      // Check if response is an array (direct data) or has a data property
      const logsData = Array.isArray(response)
        ? response
        : response?.data || [];

      if (Array.isArray(logsData)) {
        setLogs(logsData);
      } else {
        setError("Failed to fetch activity logs - unexpected response format");
        setLogs([]);
      }
    } catch (err) {
      console.error("Activity log fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch activity logs. Please try again later."
      );
      setLogs([]);
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
