import React from 'react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-indigo-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
      <p className="text-gray-600">Please wait while we load your data.</p>
    </div>
  </div>
);

export default LoadingScreen;
