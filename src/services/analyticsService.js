import axiosInstance from './axiosInstance';

export const analyticsService = {
    // Get dashboard overview
    getDashboardOverview: async () => {
        const response = await axiosInstance.get('/analytics/overview');
        return response.data;
    },

    // Get user-specific analytics
    getUserAnalytics: async () => {
        const response = await axiosInstance.get('/analytics/user');
        return response.data;
    },

    // Get chart data
    getChartData: async (period = '7d') => {
        const response = await axiosInstance.get(`/analytics/charts?period=${period}`);
        return response.data;
    },

    // Method for your existing Analytics component
    getAllDashboardData: async (timeRange = '7d') => {
        try {
            const [overview, userAnalytics, chartData] = await Promise.all([
                analyticsService.getDashboardOverview(),
                analyticsService.getUserAnalytics(),
                analyticsService.getChartData(timeRange)
            ]);

            return {
                overview,
                userAnalytics,
                chartData,
                // Mock data for compatibility with your existing component
                kpis: [
                    {
                        title: 'Total Projects',
                        value: overview.totalProjects,
                        change: '+12%',
                        icon: 'FileText',
                        color: 'blue'
                    },
                    {
                        title: 'Total Translations',
                        value: overview.totalTranslations,
                        change: '+8%',
                        icon: 'Users',
                        color: 'green'
                    },
                    {
                        title: 'Completion Rate',
                        value: `${overview.completionRate}%`,
                        change: '+5%',
                        icon: 'TrendingUp',
                        color: 'purple'
                    },
                    {
                        title: 'Active Projects',
                        value: overview.activeProjects,
                        change: '+3%',
                        icon: 'Clock',
                        color: 'orange'
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    // Export analytics
    exportAnalytics: async (format = 'json') => {
        const response = await axiosInstance.get(`/analytics/export?format=${format}`, {
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        
        if (format === 'csv') {
            // Handle CSV blob download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analytics.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        
        return response.data;
    },

    // Method for your existing Analytics component
    exportDashboardData: async (format, timeRange) => {
        return analyticsService.exportAnalytics(format);
    }
};

// Default export for your existing import
export default analyticsService;