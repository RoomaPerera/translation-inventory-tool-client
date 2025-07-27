import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { useActivityLog } from "../context/ActivityLogContext";
import ActivityTable from "../components/ActivityTable";

const ActivityLog = () => {
  const { user } = useAuthContext();
  const { logs, loading, error, getActivityLogs, userRole } = useActivityLog();
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    limit: 100,
    filterRole: "",
    userId: "",
  });

  useEffect(() => {
    if (user && user.role === "Admin") {
      getActivityLogs({
        limit: filters.limit,
        filterRole: filters.filterRole,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (user && user.role === "Translator") {
      getActivityLogs({
        startDate: filters.startDate,
        endDate: filters.endDate,
      }); // Only date filters for Translator
    }
  }, [
    user,
    filters.limit,
    filters.filterRole,
    filters.userId,
    filters.startDate,
    filters.endDate,
  ]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  };

  // Admin filter UI
  const handleRoleChange = (e) => {
    setFilters((prev) => ({ ...prev, filterRole: e.target.value }));
  };

  const handleUserIdChange = (e) => {
    setFilters((prev) => ({ ...prev, userId: e.target.value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-500">
              Please log in to view activity logs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Activity Logs
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Picker */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                    <DatePicker
                      selectsRange
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onChange={handleDateChange}
                      className="w-64 px-3 py-2 border-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg"
                      placeholderText="Select date range"
                    />
                  </div>
                  {(filters.startDate || filters.endDate) && (
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: null,
                          endDate: null,
                        }))
                      }
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Only show filter controls for Admins */}
              {user.role === "Admin" && (
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Role
                    </label>
                    <select
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={filters.filterRole}
                      onChange={handleRoleChange}
                    >
                      <option value="">All Roles</option>
                      <option value="Translator">Translator</option>
                      <option value="Developer">Developer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Filter by User ID"
                      value={filters.userId}
                      onChange={handleUserIdChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Activity Logs
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch the latest activities...
              </p>
            </div>
          </div>
        ) : (
          /* Activity Table */
          <>
            <ActivityTable logs={logs} userRole={userRole} />
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
