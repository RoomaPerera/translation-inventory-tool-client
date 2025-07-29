import React, { useState, useEffect } from 'react';
import { Users, Edit3, Wifi, WifiOff, AlertTriangle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

//user info service with caching and error handling
const getUserInfo = (userId, userService) => {
    if (!userId) {
        return {
            name: 'Unknown User',
            color: '#6B7280' // Gray color
        };
    }

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const colorIndex = Math.abs(userId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;

    // get user info from service
    if (userService?.getUser) {
        try {
            const userInfo = userService.getUser(userId);
            if (userInfo) {
                return {
                    name: userInfo.userName || userInfo.name || `User ${userId.slice(-4)}`,
                    color: userInfo.color || colors[colorIndex]
                };
            }
        } catch (error) {
            console.warn('Failed to fetch user info:', error);
        }
    }

    // Fallback to generated info
    return {
        name: `User ${userId.slice(-4)}`,
        color: colors[colorIndex]
    };
};

export const ConnectionStatus = ({ isConnected, connectionError, connectionStatus, transportType, onReconnect }) => {
    const getStatusConfig = () => {
        if (isConnected) {
            return {
                icon: CheckCircle,
                className: 'bg-green-100 text-green-800 border-green-200',
                iconColor: 'text-green-600'
            };
        } else if (connectionError?.includes('Authentication')) {
            return {
                icon: XCircle,
                className: 'bg-red-100 text-red-800 border-red-200',
                iconColor: 'text-red-600'
            };
        } else if (connectionError?.includes('timeout')) {
            return {
                icon: Clock,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                iconColor: 'text-yellow-600'
            };
        } else {
            return {
                icon: WifiOff,
                className: 'bg-brand-purple-light text-brand-purple-dark border-brand-purple-base/20',
                iconColor: 'text-brand-purple-base'
            };
        }
    };

    const { icon: StatusIcon, className, iconColor } = getStatusConfig();

    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${className}`}>
            <div className="flex items-center space-x-2">
                <StatusIcon className={`w-4 h-4 ${iconColor}`} />
                <span className="font-medium">
                    {connectionStatus || (isConnected ? 'Connected' : connectionError || 'Disconnected')}
                </span>
                {transportType && isConnected && (
                    <span className="text-xs opacity-75">
                        via {transportType.toUpperCase()}
                    </span>
                )}
            </div>

            {!isConnected && onReconnect && (
                <button
                    onClick={onReconnect}
                    className="flex items-center space-x-1 px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 transition-colors"
                    disabled={false}
                >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                </button>
            )}
        </div>
    );
};

export const ActiveUsers = ({ users = [], currentUserId, userService }) => {
    //validation and error handling
    if (!Array.isArray(users) || users.length === 0) {
        return null;
    }

    const otherUsers = users.filter(user => {
        //filtering
        if (!user || !user.id) return false;
        return user.id !== currentUserId && user.id.toString() !== currentUserId?.toString();
    });

    if (otherUsers.length === 0) return null;

    return (
        <div className="mb-4 p-4 bg-brand-purple-light border border-brand-purple-base/20 rounded-lg">
            <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-purple-base" />
                <span className="text-sm font-medium text-brand-purple-dark">
                    Active Collaborators ({otherUsers.length})
                </span>
                <div className="flex flex-wrap gap-2">
                    {otherUsers.map(user => {
                        if (!user?.id) return null;

                        const userInfo = getUserInfo(user.id, userService);
                        const displayName = user.userName || userInfo.name;

                        return (
                            <div
                                key={user.id}
                                className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm border"
                                style={{
                                    backgroundColor: userInfo.color + '20',
                                    color: userInfo.color,
                                    borderColor: userInfo.color + '40'
                                }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ backgroundColor: userInfo.color }}
                                    aria-label="Online indicator"
                                />
                                <span className="font-medium" title={`User ID: ${user.id}`}>
                                    {displayName}
                                </span>
                                {user.role && (
                                    <span className="text-xs opacity-75">({user.role})</span>
                                )}
                            </div>
                        );
                    }).filter(Boolean)}
                </div>
            </div>

        </div>
    );
};

export const TypingIndicator = ({ typingUsers = [], currentUserId, userService }) => {
    //validation
    if (!Array.isArray(typingUsers) || typingUsers.length === 0) {
        return null;
    }

    const otherTypingUsers = typingUsers.filter(userId => {
        if (!userId) return false;
        return userId !== currentUserId && userId.toString() !== currentUserId?.toString();
    });

    if (otherTypingUsers.length === 0) return null;

    return (
        <div className="mb-4 p-3 bg-brand-purple-light border borderbrand-purple-base/20 rounded-lg">
            <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-brand-purple-base animate-pulse" />
                <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="w-1 h-1 bg-brand-purple-base rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-brand-purple-dark ml-2">
                        {otherTypingUsers
                            .map(userId => getUserInfo(userId, userService).name)
                            .join(', ')}
                        {otherTypingUsers.length === 1 ? ' is' : ' are'} typing...
                    </span>
                </div>
            </div>
        </div>
    );
};

export const ConflictModal = ({ conflictData, onResolve, currentText }) => {
    const [isResolving, setIsResolving] = useState(false);

    if (!conflictData) return null;

    const handleResolve = async (action) => {
        if (isResolving) return;

        setIsResolving(true);
        try {
            if (action === 'keep-local') {
                await onResolve(action, currentText);
            } else {
                await onResolve(action);
            }
        } catch (error) {
            console.error('Error resolving conflict:', error);
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Edit Conflict Detected</h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        Someone else has modified this translation while you were editing.
                        Please choose how to resolve this conflict:
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 bg-brand-purple-light border border-brand-purple-base/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-brand-purple-base" />
                                <h4 className="font-medium text-brand-purple-dark">Server Version (Latest)</h4>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    v{conflictData.currentVersion}
                                </span>
                            </div>
                            <div className="pl-6 text-sm text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {conflictData.serverText || '(Empty)'}
                            </div>
                        </div>

                        <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Edit3 className="w-4 h-4 text-brand-cyan" />
                                <h4 className="font-medium text-brand-cyan-dark">Your Version</h4>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    v{conflictData.clientVersion}
                                </span>
                            </div>
                            <div className="pl-6 text-sm text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {currentText || '(Empty)'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => handleResolve('accept-server')}
                        disabled={isResolving}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResolving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Accept Server Version (Discard My Changes)</span>
                    </button>

                    <button
                        onClick={() => handleResolve('keep-local')}
                        disabled={isResolving}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResolving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Edit3 className="w-4 h-4" />
                        )}
                        <span>Keep My Version (Override Server)</span>
                    </button>

                    <button
                        onClick={() => handleResolve('cancel')}
                        disabled={isResolving}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel (Let Me Edit Manually)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SaveIndicator = ({ hasUnsavedChanges, onSave, isTyping: currentUserTyping, isSaving }) => (
    <div className="flex items-center space-x-3">
        <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${hasUnsavedChanges && !isSaving
                ? 'bg-brand-purple-base text-white hover:bg-brand-purple-dark'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
        >
            {isSaving ? (
                <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                </>
            ) : hasUnsavedChanges ? (
                <>
                    <Edit3 className="w-4 h-4" />
                    <span>Save Changes</span>
                </>
            ) : (
                <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved</span>
                </>
            )}
        </button>

        {currentUserTyping && (
            <div className="flex items-center space-x-2 bg-brand-purple-light text-brand-purple-dark px-3 py-1 rounded-full text-xs">
                <div className="flex space-x-1">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
                <span>You're typing...</span>
            </div>
        )}
    </div>
);

// connection management component
export const ConnectionManager = ({ isConnected, connectionError, transportType, onReconnect }) => {
    if (isConnected) return null;

    const getErrorConfig = () => {
        if (connectionError?.includes('Authentication')) {
            return {
                icon: XCircle,
                title: 'Authentication Error',
                message: 'Please refresh the page and try logging in again.',
                className: 'bg-red-50 border-red-200',
                buttonClass: 'bg-red-600 hover:bg-red-700',
                showReconnect: false
            };
        } else if (connectionError?.includes('timeout')) {
            return {
                icon: Clock,
                title: 'Connection Timeout',
                message: 'The connection to the collaboration server timed out.',
                className: 'bg-yellow-50 border-yellow-200',
                buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
                showReconnect: true
            };
        } else {
            return {
                icon: WifiOff,
                title: 'Connection Lost',
                message: 'Disconnected from collaboration server. Your changes are saved locally.',
                className: 'bg-orange-50 border-orange-200',
                buttonClass: 'bg-orange-600 hover:bg-orange-700',
                showReconnect: true
            };
        }
    };

    const { icon: ErrorIcon, title, message, className, buttonClass, showReconnect } = getErrorConfig();

    return (
        <div className={`mb-4 p-4 border rounded-lg ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <ErrorIcon className="w-5 h-5 mt-0.5 text-current" />
                    <div>
                        <h4 className="font-medium text-sm">{title}</h4>
                        <p className="text-sm opacity-90 mt-1">{message}</p>
                        {connectionError && (
                            <details className="mt-2">
                                <summary className="text-xs cursor-pointer opacity-75">Error Details</summary>
                                <p className="text-xs mt-1 font-mono bg-white bg-opacity-50 p-2 rounded break-all">
                                    {connectionError}
                                </p>
                            </details>
                        )}
                    </div>
                </div>

                {showReconnect && onReconnect && (
                    <button
                        onClick={onReconnect}
                        className={`flex items-center space-x-1 px-3 py-1 text-white text-xs rounded transition-colors ${buttonClass}`}
                    >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reconnect</span>
                    </button>
                )}
            </div>
        </div>
    );
};

//version conflict warning
export const VersionWarning = ({ serverVersion, clientVersion }) => {
    if (!serverVersion || !clientVersion || serverVersion === clientVersion) return null;

    return (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                    Version mismatch detected.
                </span>
                <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Server: v{serverVersion}
                    </span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded">
                        Your: v{clientVersion}
                    </span>
                </div>
            </div>
        </div>
    );
};

// component for transport status
export const TransportStatus = ({ transportType, isConnected }) => {
    if (!isConnected) return null;

    const getTransportConfig = () => {
        switch (transportType?.toLowerCase()) {
            case 'websocket':
                return {
                    icon: Wifi,
                    label: 'WebSocket',
                    className: 'bg-green-100 text-green-700',
                    description: 'Real-time connection active'
                };
            case 'polling':
                return {
                    icon: RefreshCw,
                    label: 'HTTP Polling',
                    className: 'bg-blue-100 text-blue-700',
                    description: 'Fallback connection active'
                };
            default:
                return {
                    icon: Wifi,
                    label: 'Connected',
                    className: 'bg-gray-100 text-gray-700',
                    description: 'Connection established'
                };
        }
    };

    const { icon: TransportIcon, label, className, description } = getTransportConfig();

    return (
        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded text-xs ${className}`}>
            <TransportIcon className="w-3 h-3" />
            <span className="font-medium">{label}</span>
            <span className="opacity-75">•</span>
            <span className="opacity-75">{description}</span>
        </div>
    );
};

// debug component for testing
export const CollaborationDebugInfo = ({
    isConnected,
    activeUsers,
    typingUsers,
    connectionError,
    version,
    hasUnsavedChanges
}) => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs">
            <h4 className="font-bold mb-2">Collaboration Debug</h4>
            <div className="space-y-1">
                <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                <div>Active Users: {activeUsers?.length || 0}</div>
                <div>Typing Users: {typingUsers?.length || 0}</div>
                <div>Version: {version}</div>
                <div>Unsaved: {hasUnsavedChanges ? 'Yes' : 'No'}</div>
                {connectionError && (
                    <div className="text-red-300">Error: {connectionError.slice(0, 50)}...</div>
                )}
            </div>
        </div>
    );
};