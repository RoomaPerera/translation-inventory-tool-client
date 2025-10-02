import React, { useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import API from "../services/axiosInstance";

// Fetch anomalies with optional filters
const fetchAnomalies = async (filters = {}) => {
  const filtered = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "")
  );

  try {
    const response = await API.get("/anomalies", { params: filtered });
    const json = response.data;

    // Backend returns: { success: true, anomalies: [...], pagination: {...} }
    if (json.success && Array.isArray(json.anomalies)) {
      return json.anomalies;
    } else if (Array.isArray(json)) {
      return json;
    } else if (Array.isArray(json.anomalies)) {
      return json.anomalies;
    }

    console.error("Unexpected API response format:", json);
    return [];
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    throw error;
  }
};

// Review an anomaly
const reviewAnomaly = async (id) => {
  try {
    const response = await API.patch(`/anomalies/${id}/review`);
    return response.data;
  } catch (error) {
    console.error(` Review API error details:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });

    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error(`Authentication failed: Please log in again`);
    } else if (error.response?.status === 404) {
      throw new Error(`Anomaly not found: ID ${id} doesn't exist`);
    } else if (error.response?.status === 500) {
      throw new Error(
        `Server error: ${
          error.response?.data?.message || "Internal server error"
        }`
      );
    } else if (error.code === "ECONNREFUSED") {
      throw new Error(`Connection refused: Backend server might be down`);
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.message === "Network Error"
    ) {
      throw new Error(
        `Network error: Cannot connect to server at ${API.defaults.baseURL}`
      );
    } else {
      throw new Error(
        `Review failed: ${error.response?.data?.message || error.message}`
      );
    }
  }
};

// Delete an anomaly
const deleteAnomaly = async (id) => {
  try {
    const response = await API.delete(`/anomalies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Delete API error:`, error.response?.data || error.message);
    throw new Error(
      `Delete failed: ${error.response?.data?.message || error.message}`
    );
  }
};

// BlockIPButton: Handles blocking a single IP
function BlockIPButton({ ip, onBlocked }) {
  const [blocking, setBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const blockIP = async () => {
    setBlocking(true);
    setBlockMessage("");
    try {
      const response = await API.post("/anomalies/block-ip", { ip });
      const json = response.data;
      if (json.success) {
        setBlockMessage(`Blocked IP: ${ip}`);
        if (onBlocked) onBlocked(ip);
      } else {
        setBlockMessage(json.message || "Failed to block IP");
      }
    } catch (error) {
      console.error("Block IP error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        setBlockMessage("Authentication failed. Please log in again.");
      } else {
        setBlockMessage(
          `Network error: ${error.response?.data?.message || error.message}`
        );
      }
    }
    setBlocking(false);
  };

  return (
    <>
      <button
        onClick={blockIP}
        disabled={blocking}
        style={{
          ...styles.button,
          backgroundColor: "#f59e42",
          color: "white",
          marginTop: 4,
          ...(blocking ? styles.buttonDisabled : {}),
        }}
      >
        {blocking ? `Blocking ${ip}...` : `Block IP: ${ip}`}
      </button>
      {blockMessage && (
        <div style={{ color: "#f59e42", marginTop: 4 }}>{blockMessage}</div>
      )}
    </>
  );
}

// AnomalyDetails: Renders details for an anomaly
function AnomalyDetails({ details }) {
  if (!details) return null;
  return (
    <div style={styles.detailBox}>
      <div style={styles.detailLabel}>Details</div>
      <div style={styles.detailValue}>
        {Array.isArray(details.ips) && details.ips.length > 0 && (
          <div>
            <strong>IPs:</strong> {details.ips.join(", ")}
          </div>
        )}
        {details.ip && (
          <div>
            <strong>IP:</strong> {details.ip}
          </div>
        )}
        {details.attempts && (
          <div>
            <strong>Attempts:</strong> {details.attempts}
          </div>
        )}
        {details.activityCount && (
          <div>
            <strong>Activities:</strong> {details.activityCount}
          </div>
        )}
      </div>
    </div>
  );
}

// AnomalyCard: Displays a single anomaly and its actions
function AnomalyCard({ anomaly, tab, onReview, onDelete }) {
  return (
    <div key={anomaly._id} style={styles.card}>
      <div style={styles.cardContent}>
        <div style={styles.cardMain}>
          <div style={styles.cardHeader}>
            <span style={styles.severityIcon}>
              {getSeverityIcon(anomaly.severity)}
            </span>
            <h3 style={styles.cardTitle}>{anomaly.type}</h3>
            <span style={getSeverityStyle(anomaly.severity)}>
              {anomaly.severity}
            </span>
          </div>
          <p style={styles.cardMessage}>{anomaly.message}</p>
          <div style={styles.detailsGrid}>
            <div style={styles.detailBox}>
              <div style={styles.detailLabel}>Detected</div>
              <div style={styles.detailValue}>
                {new Date(anomaly.detectedAt).toLocaleDateString()} at{" "}
                {new Date(anomaly.detectedAt).toLocaleTimeString()}
              </div>
            </div>
            <AnomalyDetails details={anomaly.details} />
          </div>
        </div>
        <div style={styles.cardActions}>
          {tab === "unreviewed" && (
            <>
              <button
                onClick={() => onReview(anomaly._id)}
                style={{
                  ...styles.button,
                  ...styles.buttonGreen,
                }}
              >
                Mark as Reviewed
              </button>
              <button
                onClick={() => onDelete(anomaly._id)}
                style={{
                  ...styles.button,
                  ...styles.buttonRed,
                }}
              >
                Delete
              </button>
            </>
          )}
          {tab === "reviewed" && (
            <>
              <button
                onClick={() => onDelete(anomaly._id)}
                style={{
                  ...styles.button,
                  ...styles.buttonRed,
                }}
              >
                Delete
              </button>
              {/* Block IP buttons for all relevant IPs */}
              {Array.isArray(anomaly.details?.ips) &&
                anomaly.details.ips.length > 0 &&
                anomaly.details.ips.map((ip) => (
                  <BlockIPButton key={ip} ip={ip} />
                ))}
              {anomaly.details?.ip && <BlockIPButton ip={anomaly.details.ip} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Tabs: Handles tab navigation
const Tabs = React.memo(function Tabs({
  tab,
  setTab,
  unreviewedCount,
  reviewedCount,
}) {
  // Ensure counts are numbers and not undefined/null
  const safeUnreviewedCount =
    typeof unreviewedCount === "number" ? unreviewedCount : 0;
  const safeReviewedCount =
    typeof reviewedCount === "number" ? reviewedCount : 0;

  console.log(
    "Tabs component - Unreviewed count:",
    safeUnreviewedCount,
    "Reviewed count:",
    safeReviewedCount,
    "Rendering at:",
    new Date().toISOString()
  );

  return (
    <div style={styles.tabs}>
      <div style={styles.tabNav}>
        <button
          onClick={() => setTab("unreviewed")}
          style={{
            ...styles.tabButton,
            ...(tab === "unreviewed"
              ? styles.tabButtonActive
              : styles.tabButtonHover),
          }}
        >
          Unreviewed{" "}
          {safeUnreviewedCount > 0 && (
            <span style={{ ...styles.badge, ...styles.badgeRed }}>
              {safeUnreviewedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("reviewed")}
          style={{
            ...styles.tabButton,
            ...(tab === "reviewed"
              ? styles.tabButtonActive
              : styles.tabButtonHover),
          }}
        >
          Reviewed{" "}
          {safeReviewedCount > 0 && (
            <span style={{ ...styles.badge, ...styles.badgeGreen }}>
              {safeReviewedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

// Helper: Get severity icon
function getSeverityIcon(severity) {
  switch (severity?.toLowerCase()) {
    case "high":
      return "🔴";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "⚪";
  }
}

// Helper: Get severity style
function getSeverityStyle(severity) {
  switch (severity?.toLowerCase()) {
    case "high":
      return { ...styles.severityBadge, ...styles.severityHigh };
    case "medium":
      return { ...styles.severityBadge, ...styles.severityMedium };
    case "low":
      return { ...styles.severityBadge, ...styles.severityLow };
    default:
      return { ...styles.severityBadge, ...styles.severityDefault };
  }
}

// Main AdminAnomalyDashboard component
export default function AdminAnomalyDashboard() {
  const { user } = useAuthContext();
  const [tab, setTab] = useState("unreviewed");
  const [reviewed, setReviewed] = useState([]);
  const [unreviewed, setUnreviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load anomalies from backend
  const loadAnomalies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both types with proper error handling
      const [revResult, unrevResult] = await Promise.allSettled([
        fetchAnomalies({ reviewed: "true" }),
        fetchAnomalies({ reviewed: "false" }),
      ]);

      // Handle reviewed anomalies
      let reviewedArray = [];
      if (revResult.status === "fulfilled") {
        reviewedArray = Array.isArray(revResult.value) ? revResult.value : [];
      } else {
        console.error(" Failed to load reviewed anomalies:", revResult.reason);
      }

      // Handle unreviewed anomalies
      let unreviewedArray = [];
      if (unrevResult.status === "fulfilled") {
        unreviewedArray = Array.isArray(unrevResult.value)
          ? unrevResult.value
          : [];
      } else {
        console.error(
          " Failed to load unreviewed anomalies:",
          unrevResult.reason
        );
      }

      // Update state using flushSync to ensure immediate updates
      flushSync(() => {
        setReviewed(reviewedArray);
        setUnreviewed(unreviewedArray);
      });

      console.log(
        ` State updated - Reviewed: ${reviewedArray.length}, Unreviewed: ${unreviewedArray.length}`
      );

      // Only show error if both requests failed
      if (
        revResult.status === "rejected" &&
        unrevResult.status === "rejected"
      ) {
        setError("Failed to load anomalies from server");
      }
    } catch (err) {
      console.error(" Critical error loading anomalies:", err);
      setError(`Failed to load anomalies: ${err.message}`);

      // Set empty arrays on error using flushSync
      flushSync(() => {
        setReviewed([]);
        setUnreviewed([]);
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "Admin")) {
      return;
    }
    loadAnomalies();
    // eslint-disable-next-line
  }, [user]);

  // Review handler
  const handleReview = async (id) => {
    if (!id) {
      console.error(" No ID provided for review");
      setError("Invalid anomaly ID");
      return;
    }

    // Prevent double-clicks
    if (loading) {
      return;
    }

    try {
      // Find the anomaly first to ensure it exists
      const anomalyToMove = unreviewed.find((a) => a._id === id);
      if (!anomalyToMove) {
        console.error(` Anomaly ${id} not found in unreviewed list`);
        setError("Anomaly not found in unreviewed list");
        return;
      }

      // Set loading state
      setLoading(true);
      setError(null);

      // Make the API call
      const result = await reviewAnomaly(id);
      if (result && result.success) {
        // Create updated anomaly with reviewed status
        const updatedAnomaly = { ...anomalyToMove, reviewed: true };

        // Calculate new arrays
        const newUnreviewed = unreviewed.filter((a) => a._id !== id);
        const newReviewed = [updatedAnomaly, ...reviewed];

        // Update state with flushSync for immediate UI updates
        flushSync(() => {
          setUnreviewed(newUnreviewed);
          setReviewed(newReviewed);
        });

        console.log(` UI state updated successfully`);
      } else {
        console.error(` API call failed:`, result?.message);
        setError(result?.message || "Failed to mark anomaly as reviewed");
      }
    } catch (error) {
      console.error(` Network error in handleReview:`, error.message);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!id) {
      console.error(" No ID provided for delete");
      setError("Invalid anomaly ID");
      return;
    }

    // Prevent double-clicks
    if (loading) {
      return;
    }

    if (
      !window.confirm(
        "  Are you sure you want to permanently delete this anomaly?"
      )
    ) {
      return;
    }

    try {
      // Find which list contains the anomaly
      const isInUnreviewed = unreviewed.some((a) => a._id === id);
      const isInReviewed = reviewed.some((a) => a._id === id);
      const anomalyToDelete = [...unreviewed, ...reviewed].find(
        (a) => a._id === id
      );

      if (!isInUnreviewed && !isInReviewed) {
        console.error(`Anomaly ${id} not found in either list`);
        setError("Anomaly not found");
        return;
      }

      console.log(
        ` Found anomaly to delete: ${anomalyToDelete?.type} - In unreviewed: ${isInUnreviewed}, In reviewed: ${isInReviewed}`
      );

      // Set loading state
      setLoading(true);
      setError(null);

      // Make the API call to delete from database
      const result = await deleteAnomaly(id);

      if (result && result.success) {
        // Calculate new arrays
        const newUnreviewed = unreviewed.filter((a) => a._id !== id);
        const newReviewed = reviewed.filter((a) => a._id !== id);

        console.log(
          ` New counts - Unreviewed: ${newUnreviewed.length}, Reviewed: ${newReviewed.length}`
        );

        // Update state with flushSync for immediate UI updates
        flushSync(() => {
          setUnreviewed(newUnreviewed);
          setReviewed(newReviewed);
        });

        console.log(` UI state updated successfully`);
      } else {
        console.error(` Database deletion failed:`, result?.message);
        setError(result?.message || "Failed to delete anomaly from database");
      }
    } catch (error) {
      console.error(` Network error in handleDelete:`, error.message);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.wrapper, textAlign: "center" }}>
          <div style={{ color: "#dc2626" }}>Please log in.</div>
        </div>
      </div>
    );
  }
  if (user.role !== "admin" && user.role !== "Admin") {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.wrapper, textAlign: "center" }}>
          <div style={{ color: "#dc2626" }}>Access denied. Admins only.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Anomaly & Alert Dashboard</h1>
          <p style={styles.subtitle}>
            Manage and review security anomalies and alerts.
          </p>
        </div>
        {/* Tabs */}
        <Tabs
          key={`tabs-${unreviewed.length}-${reviewed.length}`}
          tab={tab}
          setTab={setTab}
          unreviewedCount={Array.isArray(unreviewed) ? unreviewed.length : 0}
          reviewedCount={Array.isArray(reviewed) ? reviewed.length : 0}
        />
        {/* Content */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <span style={{ color: "#666" }}>Loading anomalies...</span>
          </div>
        ) : error ? (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div>
            {(tab === "unreviewed" ? unreviewed : reviewed).length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>📄</div>
                <h3 style={{ marginBottom: "5px", color: "#333" }}>
                  No anomalies
                </h3>
                <p>
                  {tab === "unreviewed"
                    ? "No unreviewed anomalies found."
                    : "No reviewed anomalies found."}
                </p>
              </div>
            ) : (
              (tab === "unreviewed" ? unreviewed : reviewed).map((anomaly) => (
                <AnomalyCard
                  key={anomaly._id}
                  anomaly={anomaly}
                  tab={tab}
                  onReview={handleReview}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles object moved to bottom for clarity
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  wrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
  },
  tabs: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    marginBottom: "20px",
  },
  tabNav: {
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
  },
  tabButton: {
    padding: "15px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderBottom: "2px solid transparent",
    color: "#666",
  },
  tabButtonActive: {
    color: "#8b5cf6",
    borderBottomColor: "#8b5cf6",
  },
  tabButtonHover: {
    color: "#333",
    borderBottomColor: "#ccc",
  },
  badge: {
    marginLeft: "8px",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  badgeRed: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  spinner: {
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #8b5cf6",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    animation: "spin 1s linear infinite",
    marginRight: "10px",
  },
  error: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    color: "#dc2626",
  },
  empty: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    padding: "40px",
    textAlign: "center",
    color: "#666",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    padding: "20px",
    marginBottom: "15px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  severityIcon: {
    fontSize: "18px",
    marginRight: "10px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginRight: "10px",
  },
  severityBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid",
  },
  severityHigh: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderColor: "#fecaca",
  },
  severityMedium: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
    borderColor: "#fed7aa",
  },
  severityLow: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    borderColor: "#bbf7d0",
  },
  severityDefault: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderColor: "#d1d5db",
  },
  cardMessage: {
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  detailBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    padding: "12px",
  },
  detailLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#666",
    marginBottom: "5px",
  },
  detailValue: {
    fontSize: "14px",
    color: "#333",
  },
  cardActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginLeft: "20px",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonGreen: {
    backgroundColor: "#10b981",
    color: "white",
  },
  buttonGreenHover: {
    backgroundColor: "#059669",
  },
  buttonRed: {
    backgroundColor: "#ef4444",
    color: "white",
  },
  buttonRedHover: {
    backgroundColor: "#dc2626",
  },
  buttonDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  cardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMain: {
    flex: "1",
  },
};
