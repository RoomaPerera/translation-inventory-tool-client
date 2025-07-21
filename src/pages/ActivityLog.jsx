import React from 'react';

const ActivityLog = () => {
  return (
    <main className="flex-grow p-5 bg-brand-bg-main min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
        <p className="text-gray-600">This page is a placeholder for the Activity Log feature.</p>
        <div className="mt-4 border-t pt-4">
          <div className="text-sm text-gray-700 py-2">
            <span className="font-semibold">WADRU Perera</span> updated translation for key <span className="font-mono bg-gray-100 px-1 rounded">GREETING</span> in <span className="font-semibold">FR</span>.
            <div className="text-xs text-gray-400 mt-1">July 20, 2025, 10:30 AM</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ActivityLog;