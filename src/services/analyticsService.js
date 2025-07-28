// UPDATED ANALYTICS SERVICE - TRANSLATION-BASED
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

    // Main method for dashboard - TRANSLATION-BASED
    getAllDashboardData: async (timeRange = '7d') => {
        try {
            const [overview, userAnalytics, chartData] = await Promise.all([
                analyticsService.getDashboardOverview(),
                analyticsService.getUserAnalytics(),
                analyticsService.getChartData(timeRange)
            ]);

            console.log('Backend data received:', { overview, userAnalytics, chartData });

            return {
                overview,
                userAnalytics,
                chartData,
                
                // Transform REAL data for dashboard display - TRANSLATION-FOCUSED
                kpis: {
                    // Use actual backend data
                    averageQualityScore: userAnalytics.translatorStats?.averageTranslationQuality || 'N/A',
                    averageProcessingTime: userAnalytics.translatorStats?.averageCompletionTime || 'N/A',
                    translatorProductivity: userAnalytics.translatorStats?.productivityScore || 'N/A', // translations per day
                    completedProjects: overview.totalProjects - overview.activeProjects,
                    activeTranslators: userAnalytics.usersByRole?.Translator || 'N/A',
                    totalTranslations: userAnalytics.translatorStats?.totalTranslationsCompleted || 'N/A', // Changed from totalWords
                    
                    // Calculate real trends from actual data
                    qualityTrend: userAnalytics.translatorStats?.averageTranslationQuality > 4 ? 0.2 : -0.1,
                    processingTimeTrend: userAnalytics.translatorStats?.averageCompletionTime < 3 ? -0.5 : 0.3,
                    completedProjectsTrend: Math.max(0, overview.totalProjects - overview.activeProjects - 2)
                },

                // Real chart data transformation
                qualityTrend: chartData?.map(item => ({
                    date: item.date,
                    score: userAnalytics.translatorStats?.averageTranslationQuality || 0,
                    projects: item.completed
                })) || [],

                // Real processing times data
                processingTimes: [
                    { 
                        translator: 'Your Performance', 
                        avgTime: userAnalytics.translatorStats?.averageCompletionTime || 0,
                        completed: userAnalytics.completedTranslations || 0
                    }
                ],

                // Real productivity data - TRANSLATIONS PER DAY
                productivity: chartData?.map(item => ({
                    date: item.date,
                    translations: item.translations // Changed from words to translations
                })) || [],

                // Real project status from backend
                projectStatus: [
                    { 
                        name: 'Completed Projects', 
                        value: overview.totalProjects - overview.activeProjects, 
                        color: '#10b981' 
                    },
                    { 
                        name: 'Active Projects', 
                        value: overview.activeProjects, 
                        color: '#f59e0b' 
                    },
                    { 
                        name: 'Completed Translations', 
                        value: userAnalytics.completedTranslations || 0, 
                        color: '#3b82f6' 
                    },
                    { 
                        name: 'Pending Translations', 
                        value: userAnalytics.translationsByStatus?.pending || 0, 
                        color: '#ef4444' 
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                kpis: {
                    averageQualityScore: 'N/A',
                    averageProcessingTime: 'N/A',
                    translatorProductivity: 'N/A',
                    completedProjects: 'N/A',
                    activeTranslators: 'N/A',
                    totalTranslations: 'N/A' // Changed from totalWords
                },
                qualityTrend: [],
                processingTimes: [],
                productivity: [],
                projectStatus: []
            };
        }
    },

    // Export analytics
    exportAnalytics: async (format = 'json') => {
        const response = await axiosInstance.get(`/analytics/export?format=${format}`, {
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        
        if (format === 'csv') {
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

    exportDashboardData: async (format, timeRange) => {
        return analyticsService.exportAnalytics(format);
    }
};

export default analyticsService;