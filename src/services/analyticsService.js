// // services/analyticsService.js
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// class AnalyticsService {
//   // Get authentication token from localStorage
//   getAuthToken() {
//     const user = JSON.parse(localStorage.getItem('user'));
//     return user?.token;
//   }

//   // Common fetch configuration
//   async fetchWithAuth(endpoint, options = {}) {
//     const token = this.getAuthToken();
    
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { 'Authorization': `Bearer ${token}` }),
//         ...options.headers,
//       },
//       ...options,
//     };

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return response.json();
//   }

//   // Get KPI summary data
//   async getKPIs(timeRange = '7d') {
//     try {
//       return await this.fetchWithAuth(`/analytics/kpis?timeRange=${timeRange}`);
//     } catch (error) {
//       console.error('Error fetching KPIs:', error);
//       throw error;
//     }
//   }

//   // Get quality trend data
//   async getQualityTrend(timeRange = '7d') {
//     try {
//       return await this.fetchWithAuth(`/analytics/quality-trend?timeRange=${timeRange}`);
//     } catch (error) {
//       console.error('Error fetching quality trend:', error);
//       throw error;
//     }
//   }

//   // Get processing times by translator
//   async getProcessingTimes(timeRange = '7d') {
//     try {
//       return await this.fetchWithAuth(`/analytics/processing-times?timeRange=${timeRange}`);
//     } catch (error) {
//       console.error('Error fetching processing times:', error);
//       throw error;
//     }
//   }

//   // Get productivity data
//   async getProductivity(timeRange = '7d') {
//     try {
//       return await this.fetchWithAuth(`/analytics/productivity?timeRange=${timeRange}`);
//     } catch (error) {
//       console.error('Error fetching productivity:', error);
//       throw error;
//     }
//   }

//   // Get project status distribution
//   async getProjectStatus(timeRange = '7d') {
//     try {
//       return await this.fetchWithAuth(`/analytics/project-status?timeRange=${timeRange}`);
//     } catch (error) {
//       console.error('Error fetching project status:', error);
//       throw error;
//     }
//   }

//   // Get all dashboard data at once
//   async getAllDashboardData(timeRange = '7d') {
//     try {
//       const [kpis, qualityTrend, processingTimes, productivity, projectStatus] = await Promise.all([
//         this.getKPIs(timeRange),
//         this.getQualityTrend(timeRange),
//         this.getProcessingTimes(timeRange),
//         this.getProductivity(timeRange),
//         this.getProjectStatus(timeRange)
//       ]);

//       return {
//         kpis,
//         qualityTrend,
//         processingTimes,
//         productivity,
//         projectStatus
//       };
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       throw error;
//     }
//   }

//   // Export dashboard data
//   async exportDashboardData(format, timeRange = '7d') {
//     try {
//       const response = await fetch(`${API_BASE_URL}/analytics/export?format=${format}&timeRange=${timeRange}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${this.getAuthToken()}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Export failed: ${response.status}`);
//       }

//       // Handle different export formats
//       if (format === 'json') {
//         return response.json();
//       } else {
//         // For PDF/Excel, return blob
//         const blob = await response.blob();
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `analytics-report-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Error exporting data:', error);
//       throw error;
//     }
//   }
// }

// export default new AnalyticsService();