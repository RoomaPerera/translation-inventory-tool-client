import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, RefreshCw, TrendingUp, TrendingDown, Clock, Users, FileText, Star, AlertCircle } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import axiosInstance from '../services/axiosInstance';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async (timeRange) => {
    try {
      setError(null);
      const data = await analyticsService.getAllDashboardData(timeRange);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Refresh dashboard
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData(selectedTimeRange);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export report
  const exportReport = async (format) => {
    try {
      await analyticsService.exportDashboardData(format, selectedTimeRange);
    } catch (error) {
      console.error('Export failed:', error);
      setError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchDashboardData(selectedTimeRange);
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">No Data Available</h3>
                <p className="text-yellow-700 mt-1">No analytics data found for the selected time range.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, qualityTrend, processingTimes, productivity, projectStatus } = dashboardData;

const populateData = async () => {
    try {
        setLoading(true);
        const response = await axiosInstance.post('/analytics/populate');
        console.log('Data populated:', response.data);
        // Refresh the dashboard after population
        await fetchDashboardData(selectedTimeRange);
        alert('Analytics data populated successfully!');
    } catch (error) {
        console.error('Failed to populate data:', error);
        alert('Failed to populate data. Check console for details.');
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Translation Analytics Dashboard</h1>
              <p className="text-gray-600">Monitor KPIs and project performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={populateData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Star className="w-4 h-4 mr-2" />
                Populate Data
              </button>
              <div className="relative group">
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => exportReport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => exportReport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => exportReport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.averageQualityScore || 'N/A'}</p>
                {kpis?.qualityTrend && (
                  <div className="flex items-center mt-1">
                    {kpis.qualityTrend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${kpis.qualityTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.qualityTrend > 0 ? '+' : ''}{kpis.qualityTrend}
                    </span>
                  </div>
                )}
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.averageProcessingTime || 'N/A'}h</p>
                {kpis?.processingTimeTrend && (
                  <div className="flex items-center mt-1">
                    {kpis.processingTimeTrend < 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${kpis.processingTimeTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.processingTimeTrend}h
                    </span>
                  </div>
                )}
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.translatorProductivity || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">words/day</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.completedProjects || 'N/A'}</p>
                {kpis?.completedProjectsTrend && (
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">+{kpis.completedProjectsTrend}</span>
                  </div>
                )}
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Translators</p>
                <p className="text-2xl font-bold text-gray-900">{kpis?.activeTranslators || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">currently working</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.totalWords ? `${(kpis.totalWords / 1000).toFixed(0)}K` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">this period</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quality Trend */}
          {qualityTrend && qualityTrend.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [value, name === 'score' ? 'Quality Score' : 'Projects']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Processing Times */}
          {processingTimes && processingTimes.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Times by Translator</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processingTimes} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="translator" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}h`, 'Avg Processing Time']} />
                  <Bar dataKey="avgTime" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Trend */}
          {productivity && productivity.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Productivity (Words)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString().split('/')[1]} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} words`, 'Daily Average']}
                  />
                  <Line type="monotone" dataKey="words" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Project Status */}
          {projectStatus && projectStatus.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Table */}
        {processingTimes && processingTimes.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Translator Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time (h)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processingTimes.map((translator, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{translator.translator}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{translator.avgTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{translator.completed}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          translator.avgTime < 2.0 ? 'bg-green-100 text-green-800' :
                          translator.avgTime < 2.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {translator.avgTime < 2.0 ? 'High' : translator.avgTime < 2.5 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;