import API from './axiosInstance';

class AnalyticsService {
  // Get all dashboard data
  async getAllDashboardData(timeRange = '7d') {
    try {
      const response = await API.get(`/analytics/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // Export dashboard data
  async exportDashboardData(format = 'json', timeRange = '7d') {
    try {
      const response = await API.get(`/analytics/export?format=${format}&timeRange=${timeRange}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${timeRange}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle other formats when implemented
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${timeRange}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return response.data;
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      throw error;
    }
  }

  // Get specific KPIs only
  async getKPIs(timeRange = '7d') {
    try {
      const data = await this.getAllDashboardData(timeRange);
      return data.kpis;
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  }

  // Get chart data only
  async getChartData(timeRange = '7d') {
    try {
      const data = await this.getAllDashboardData(timeRange);
      return {
        qualityTrend: data.qualityTrend,
        processingTimes: data.processingTimes,
        productivity: data.productivity,
        projectStatus: data.projectStatus
      };
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();