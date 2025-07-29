// Utility functions for notifications and error handling

export const showToast = (message, type = 'info') => {
  // Simple toast implementation - you can replace with a more sophisticated library
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  
  if (error.response) {
    // Server responded with error status
    message = error.response.data?.message || `Server Error: ${error.response.status}`;
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection.';
  } else {
    // Other error
    message = error.message || defaultMessage;
  }
  
  showToast(message, 'error');
  return message;
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
