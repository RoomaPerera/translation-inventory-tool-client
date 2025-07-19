import { API_BASE } from '../config/env';

// Test function to check backend connectivity
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Backend connection test:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Activity log API functions using fetch to match existing auth pattern
export const fetchActivityLogs = async (filters = {}) => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(user);
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.filterRole) params.append('filterRole', filters.filterRole);
    if (filters.userId) params.append('userId', filters.userId);

    const response = await fetch(`${API_BASE}/api/activitylogs?${params}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Activity logs endpoint not found. Please add the backend routes.');
      }
      const errorText = await response.text();
      console.error('Response text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

// Add new activity log
export const addActivityLog = async (logData) => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(user);
    const response = await fetch(`${API_BASE}/api/activitylogs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`
      },
      body: JSON.stringify(logData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add activity log');
    }

    return data;
  } catch (error) {
    console.error('Error adding activity log:', error);
    throw error;
  }
}; 