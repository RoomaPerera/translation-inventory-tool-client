import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  bgColor = 'bg-gray-50', 
  borderColor = 'border-gray-200',
  textColor = 'text-gray-800', 
  buttonColor = 'bg-gray-600', 
  buttonHoverColor = 'hover:bg-gray-700',
  buttonText = 'Open', 
  onClick, 
  href, 
  badge,
  disabled = false,
  external = false
}) => {
  const buttonBaseClass = `inline-flex items-center px-4 py-2 text-white rounded-md transition-colors text-sm font-medium`;
  const buttonClass = disabled 
    ? `${buttonBaseClass} bg-gray-400 cursor-not-allowed` 
    : `${buttonBaseClass} ${buttonColor} ${buttonHoverColor}`;

  const renderButton = () => {
    if (disabled) {
      return (
        <button className={buttonClass} disabled>
          {buttonText}
        </button>
      );
    }

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            {buttonText}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      }
      
      return (
        <Link to={href} className={buttonClass}>
          {buttonText}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      );
    }

    return (
      <button onClick={onClick} className={buttonClass}>
        {buttonText}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  };

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6 transition-shadow hover:shadow-md`}>
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <h3 className={`text-lg font-semibold ${textColor} ml-3`}>{title}</h3>
      </div>
      
      <p className={`${textColor.replace('text-', 'text-').replace('800', '700')} mb-4 text-sm leading-relaxed`}>
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {badge && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              badge.type === 'admin' ? 'bg-red-100 text-red-800' :
              badge.type === 'developer' ? 'bg-blue-100 text-blue-800' :
              badge.type === 'req' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          {renderButton()}
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;