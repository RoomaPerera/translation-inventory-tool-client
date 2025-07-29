// config/env.js - Environment configuration
// This should be created in your frontend src/config/ directory

// Get the API base URL from environment variables or use defaults
const getApiBase = () => {
    // In production, these should be set via environment variables
    const envApiBase = import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_REACT_APP_API_BASE_URL;

    if (envApiBase) {
        return envApiBase;
    }

    // Development defaults
    if (import.meta.env.DEV) {
        return 'http://localhost:5000'; // Match your backend port
    }

    // Production fallback - should be overridden by env vars
    return window.location.origin;
};

export const API_BASE = getApiBase();

// WebSocket/Socket.IO server URL (usually same as API base)
export const SOCKET_BASE = import.meta.env.VITE_SOCKET_URL || API_BASE;

// Other environment-specific configs
export const NODE_ENV = import.meta.env.MODE || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// Debug logging
if (IS_DEVELOPMENT) {
    console.log('Environment Configuration:', {
        API_BASE,
        SOCKET_BASE,
        NODE_ENV,
        IS_DEVELOPMENT,
        IS_PRODUCTION
    });
}