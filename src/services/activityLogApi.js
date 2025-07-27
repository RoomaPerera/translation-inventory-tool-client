import axiosInstance from './axiosInstance';

// Fetch activity logs, optionally filtered by role or userId
export function fetchActivityLogs({ filterRole, userId, startDate, endDate, limit } = {}) {
  const params = new URLSearchParams();
  if (filterRole) params.append('filterRole', filterRole);
  if (userId) params.append('userId', userId);
  if (startDate) {
    params.append('startDate', startDate.toISOString());
  }
  if (endDate) {
    params.append('endDate', endDate.toISOString());
  }
  if (limit) params.append('limit', limit);

  const url = params.toString() ? `/activitylogs?${params}` : '/activitylogs';

  return axiosInstance.get(url)
    .then(res => res.data);
}