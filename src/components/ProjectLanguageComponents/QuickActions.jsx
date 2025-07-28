import React from 'react';
import QuickActionCard from '../ProjectLanguageComponents/QuickActionCard';

const QuickActions = ({ setActiveTab }) => {
  const quickActionItems = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage translators and assign languages to users. View user lists and approve pending registrations.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      buttonColor: 'bg-purple-600',
      buttonHoverColor: 'hover:bg-purple-700',
      buttonText: 'Open',
      href: '/translator-management',
      badge: { type: 'req', text: 'REQ-18' }
    },
    {
      id: 'translation-files',
      title: 'Translation Files',
      description: 'Generate and download translation files for developers. Access project-specific translation data.',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-600',
      buttonHoverColor: 'hover:bg-green-700',
      buttonText: 'Select Project',
      onClick: () => setActiveTab('projects'),
      badge: { type: 'req', text: 'REQ-19' }
    },
    {
      id: 'file-upload',
      title: 'File Upload',
      description: 'Upload translation files to update existing translations with value replacement support.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-600',
      buttonHoverColor: 'hover:bg-blue-700',
      buttonText: 'Select Project',
      onClick: () => setActiveTab('projects'),
      badge: { type: 'req', text: 'REQ-20' }
    },
    {
      id: 'translation-contexts',
      title: 'Translation Contexts',
      description: 'Manage translation variations based on different contexts. View contextual translations.',
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      buttonColor: 'bg-yellow-600',
      buttonHoverColor: 'hover:bg-yellow-700',
      buttonText: 'View Contexts',
      onClick: () => setActiveTab('projects'),
      badge: { type: 'req', text: 'REQ-21' }
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences for the translation inventory tool.',
      icon: (
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      buttonColor: 'bg-gray-600',
      buttonHoverColor: 'hover:bg-gray-700',
      buttonText: 'Coming Soon',
      disabled: true,
      badge: { type: 'admin', text: 'Admin' }
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      description: 'Access API documentation and developer resources for integration.',
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800',
      buttonColor: 'bg-indigo-600',
      buttonHoverColor: 'hover:bg-indigo-700',
      buttonText: 'Test API',
      href: 'http://localhost:5000/api/test',
      external: true,
      badge: { type: 'developer', text: 'Developer' }
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        {/* <h2 className="text-xl font-semibold mb-2">Quick Actions</h2> */}
        {/* <p className="text-gray-600 text-sm">
          Access advanced features and management tools for your translation system.
        </p> */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActionItems.map((item) => (
          <QuickActionCard
            key={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
            bgColor={item.bgColor}
            borderColor={item.borderColor}
            textColor={item.textColor}
            buttonColor={item.buttonColor}
            buttonHoverColor={item.buttonHoverColor}
            buttonText={item.buttonText}
            onClick={item.onClick}
            href={item.href}
            external={item.external}
            disabled={item.disabled}
            badge={item.badge}
          />
        ))}
      </div>
      
      {/* Additional Info Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800">Need Help?</h3>
        </div>
        <p className="text-sm text-gray-600">
          These tools help you manage your translation workflow efficiently. 
          Start with Project Management to set up your projects and languages, 
          then use Quick Actions to access advanced features.
        </p>
      </div>
    </div>
  );
};

export default QuickActions;