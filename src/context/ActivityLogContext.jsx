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
      const response = await fetchActivityLogs(filters);

      // Your backend returns logs directly as array
      if (Array.isArray(response)) {
        setLogs(response);
      } else {
        console.error("Unexpected response format:", response);
        setError("Failed to fetch activity logs - unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      if (err.message.includes("404") || err.message.includes("not found")) {
        setError(
          "Activity logs feature not available yet. Backend routes need to be added."
        );
      } else {
        setError(
          err.message ||
            "Failed to fetch activity logs. Please try again later."
        );
      }
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
