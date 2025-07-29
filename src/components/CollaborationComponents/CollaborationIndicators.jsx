import React from 'react';
import { Users, Edit3, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

// Mock user data - replace with your actual user service
const getUserInfo = (userId, userService) => {
    // Replace this with your actual user lookup
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    const colorIndex = parseInt(userId.slice(-1)) % colors.length;

    return userService?.getUser?.(userId) || {
        name: `User ${userId.slice(-3)}`,
        color: colors[colorIndex]
    };
};

export const ConnectionStatus = ({ isConnected, connectionError }) => (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isConnected ? 'Connected' : connectionError || 'Disconnected'}</span>
    </div>
);

export const ActiveUsers = ({ users, currentUserId, userService }) => {
    if (users.length === 0) return null;

    return (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Active Collaborators</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {users.filter(user => user.id !== currentUserId).map(user => {
                    const userInfo = getUserInfo(user.id, userService);
                    return (
                        <div
                            key={user.id}
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: userInfo.color + '20', color: userInfo.color }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: userInfo.color }}
                            />
                            <span>{userInfo.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const TypingIndicator = ({ typingUsers, currentUserId, userService }) => {
    const otherTypingUsers = typingUsers.filter(userId => userId !== currentUserId);

    if (otherTypingUsers.length === 0) return null;

    return (
        <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-yellow-600 animate-pulse" />
                <span className="text-sm text-yellow-700">
                    {otherTypingUsers.map(userId => getUserInfo(userId, userService).name).join(', ')}
                    {otherTypingUsers.length === 1 ? ' is' : ' are'} typing...
                </span>
            </div>
        </div>
    );
};

export const ConflictModal = ({ conflictData, onResolve, currentText }) => {
    if (!conflictData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Edit Conflict Detected</h3>
                </div>
                <p className="text-gray-600 mb-4">
                    Someone else has modified this translation. How would you like to resolve this conflict?
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => onResolve('accept-server')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Accept Their Changes
                    </button>
                    <button
                        onClick={() => onResolve('keep-local', currentText)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:blue-green-700 transition-colors"
                    >
                        Keep My Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SaveIndicator = ({ hasUnsavedChanges, onSave, isTyping: currentUserTyping }) => (
    <div className="flex items-center space-x-2">
        <button
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${hasUnsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
        >
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </button>

        {currentUserTyping && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <span>You're typing...</span>
            </div>
        )}
    </div>
);