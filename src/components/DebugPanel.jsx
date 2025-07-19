import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import projectService from '../services/projectService';
import languageService from '../services/languageService';

const DebugPanel = () => {
  const { user } = useAuthContext();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, result, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check user authentication
      addTestResult('User Authentication', user ? 'Authenticated' : 'Not authenticated', user ? null : 'No user found in context');

      // Test 2: Test API connection
      try {
        const apiTest = await projectService.testConnection();
        addTestResult('API Connection', 'Success', null);
      } catch (error) {
        addTestResult('API Connection', 'Failed', error.message);
      }

      // Test 3: Test projects endpoint
      try {
        const projects = await projectService.getProjects();
        addTestResult('Projects Fetch', `Success - ${projects.length} projects`, null);
      } catch (error) {
        addTestResult('Projects Fetch', 'Failed', error.message);
      }

      // Test 4: Test languages endpoint
      try {
        const languages = await languageService.getLanguages();
        addTestResult('Languages Fetch', `Success - ${languages.length} languages`, null);
      } catch (error) {
        addTestResult('Languages Fetch', 'Failed', error.message);
      }

    } catch (error) {
      addTestResult('Overall Test', 'Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Debug Panel</h3>
      
      <div className="mb-4">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Test Results:</h4>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.error
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-green-50 border-green-500 text-green-700'
              }`}
            >
              <div className="font-medium">{result.test}</div>
              <div className="text-sm">{result.result}</div>
              {result.error && (
                <div className="text-xs mt-1 font-mono bg-red-100 p-2 rounded">
                  {result.error}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h4 className="font-medium text-gray-700 mb-2">Current State:</h4>
        <div className="text-sm space-y-1">
          <div>User: {user ? `${user.email} (${user.role})` : 'Not logged in'}</div>
          <div>API URL: {projectService.API_URL}</div>
          <div>Current Time: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
