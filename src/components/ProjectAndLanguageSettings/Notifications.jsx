import React from 'react';

const Notifications = ({ notifications }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}></div>
          <span className="font-medium break-words">{notification.message}</span>
        </div>
      </div>
    ))}
  </div>
);

export default Notifications;
