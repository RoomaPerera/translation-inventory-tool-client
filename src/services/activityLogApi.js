// Add a new activity log entry (cookie-based auth)
export function addActivity(description) {
  return fetch('/api/activitylogs', {
    method: 'POST',
    credentials: 'include', // Send HTTP-only cookie for authentication
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  })
  .then(res => res.json());
}

// Fetch activity logs, optionally filtered by role or userId (cookie-based auth)
export function fetchActivityLogs({ filterRole, userId } = {}) {
  const params = new URLSearchParams();
  if (filterRole) params.append('filterRole', filterRole);
  if (userId)     params.append('userId', userId);

  const url = params.toString() ? `/api/activitylogs?${params}` : '/api/activitylogs';

  return fetch(url, {
    credentials: 'include', // Send HTTP-only cookie for authentication
  })
  .then(res => res.json());
}