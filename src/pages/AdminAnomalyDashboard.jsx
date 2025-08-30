import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { API_BASE } from "../config/env";

// Fetch anomalies with optional filters
const fetchAnomalies = async (filters = {}) => {
  const filtered = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "")
  );
  const params = new URLSearchParams(filtered).toString();
  const res = await fetch(`${API_BASE}/api/anomalies?${params}`, {
    credentials: "include",
  });
  const json = await res.json();
  return Array.isArray(json.anomalies) ? json.anomalies : [];
};

// Review an anomaly
const reviewAnomaly = async (id) => {
  const res = await fetch(`${API_BASE}/api/anomalies/${id}/review`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

// Delete an anomaly
const deleteAnomaly = async (id) => {
  const res = await fetch(`${API_BASE}/api/anomalies/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

// BlockIPButton: Handles blocking a single IP
function BlockIPButton({ ip, onBlocked }) {
  const [blocking, setBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const blockIP = async () => {
    setBlocking(true);
    setBlockMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/anomalies/block-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ip }),
      });
      const json = await res.json();
      if (json.success) {
        setBlockMessage(`Blocked IP: ${ip}`);
        if (onBlocked) onBlocked(ip);
      } else {
        setBlockMessage(json.message || "Failed to block IP");
      }
    } catch (e) {
      setBlockMessage("Network error");
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
            <button
              onClick={() => onReview(anomaly._id)}
              style={{
                ...styles.button,
                ...styles.buttonGreen,
              }}
            >
              Review
            </button>
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
              {Array.isArray(anomaly.details.ips) &&
                anomaly.details.ips.length > 0 &&
                anomaly.details.ips.map((ip) => (
                  <BlockIPButton key={ip} ip={ip} />
                ))}
              {anomaly.details.ip && <BlockIPButton ip={anomaly.details.ip} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Tabs: Handles tab navigation
function Tabs({ tab, setTab, unreviewedCount, reviewedCount }) {
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
          Unreviewed
          {unreviewedCount > 0 && (
            <span style={{ ...styles.badge, ...styles.badgeRed }}>
              {unreviewedCount}
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
          Reviewed
          {reviewedCount > 0 && (
            <span style={{ ...styles.badge, ...styles.badgeGreen }}>
              {reviewedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

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
  const loadAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rev, unrev] = await Promise.all([
        fetchAnomalies({ reviewed: "true" }),
        fetchAnomalies({ reviewed: "false" }),
      ]);
      setReviewed(Array.isArray(rev) ? rev : []);
      setUnreviewed(Array.isArray(unrev) ? unrev : []);
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadAnomalies();
    // eslint-disable-next-line
  }, [user]);

  // Review handler
  const handleReview = async (id) => {
    try {
      await reviewAnomaly(id);
      await loadAnomalies();
    } catch {
      setError("Failed to review anomaly");
      await loadAnomalies();
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this anomaly?"))
      return;
    try {
      await deleteAnomaly(id);
      await loadAnomalies();
    } catch {
      setError("Failed to delete anomaly");
      await loadAnomalies();
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
  if (user.role !== "admin") {
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
            Manage and review security anomalies and alerts in your system.
          </p>
        </div>
        {/* Tabs */}
        <Tabs
          tab={tab}
          setTab={setTab}
          unreviewedCount={unreviewed.length}
          reviewedCount={reviewed.length}
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
