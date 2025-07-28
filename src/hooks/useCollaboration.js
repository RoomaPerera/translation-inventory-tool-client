// src/hooks/useCollaboration.js - FIXED VERSION
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export const useCollaboration = ({
    translationId,
    serverUrl = (() => {
        // Try to get the server URL from environment variables
        const viteServerUrl = import.meta.env.VITE_SERVER_URL;
        const reactAppServerUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

        // Fixed: Use the correct default port (5000 instead of 3001)
        return viteServerUrl || reactAppServerUrl || 'http://localhost:5000';
    })()
}) => {
    // States
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [version, setVersion] = useState(1);
    const [connectionError, setConnectionError] = useState(null);

    // Refs
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);

    // Initialize socket connection
    useEffect(() => {
        if (!translationId) {
            console.log('No translation ID provided, skipping collaboration setup');
            return;
        }

        console.log('Initializing collaboration for translation:', translationId);

        const connectSocket = () => {
            const socket = io(serverUrl, {
                withCredentials: true, // This ensures cookies are sent with the request
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                maxReconnectionAttempts: 5
            });

            socketRef.current = socket;

            // Connection event handlers
            socket.on('connect', () => {
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                console.log('Connected to collaboration server');

                // Join the translation room
                socket.emit('joinTranslation', translationId);
            });

            socket.on('disconnect', (reason) => {
                setIsConnected(false);
                setIsTyping(false);
                isTypingRef.current = false;
                console.log('Disconnected from collaboration server:', reason);

                // Don't show error for intentional disconnects
                if (reason !== 'io client disconnect') {
                    setConnectionError(`Disconnected: ${reason}`);
                }
            });

            socket.on('connect_error', (error) => {
                setConnectionError(error.message);
                setIsConnected(false);
                console.error('Connection error:', error);

                // Implement exponential backoff for reconnection
                reconnectAttempts.current += 1;
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

                if (reconnectAttempts.current <= 5) {
                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (socketRef.current && socketRef.current.disconnected) {
                            socketRef.current.connect();
                        }
                    }, delay);
                }
            });

            // Collaboration event handlers
            socket.on('activeUsers', ({ users, typingUsers: currentTyping }) => {
                console.log('Received active users:', users, 'typing:', currentTyping);
                setActiveUsers(users || []);
                setTypingUsers(currentTyping || []);
            });

            socket.on('activeUsersUpdate', ({ activeUsers: updatedUsers }) => {
                console.log('Active users updated:', updatedUsers);
                setActiveUsers(updatedUsers || []);
            });

            socket.on('userJoined', ({ userId, userName, joinedAt }) => {
                console.log(`User ${userName} (${userId}) joined the translation at ${joinedAt}`);
            });

            socket.on('userLeft', ({ userId, userName, leftAt }) => {
                console.log(`User ${userName} (${userId}) left the translation at ${leftAt}`);
                // Remove from typing users if they were typing
                setTypingUsers(prev => prev.filter(id => id !== userId));
            });

            socket.on('userStartedTyping', ({ userId, userName, timestamp }) => {
                console.log(`User ${userName} (${userId}) started typing at ${timestamp}`);
                setTypingUsers(prev => {
                    if (!prev.includes(userId)) {
                        return [...prev, userId];
                    }
                    return prev;
                });
            });

            socket.on('userStoppedTyping', ({ userId, userName, timestamp }) => {
                console.log(`User ${userName} (${userId}) stopped typing at ${timestamp}`);
                setTypingUsers(prev => prev.filter(id => id !== userId));
            });

            socket.on('textChanged', ({ userId, userName, delta, version: remoteVersion, timestamp }) => {
                // Handle real-time text changes from other users
                console.log(`Text changed by ${userName} (${userId}):`, delta, 'version:', remoteVersion);
                // This would integrate with operational transform if implemented
                // For now, we just log it but don't update the UI to avoid conflicts
            });

            socket.on('translationUpdated', ({
                translationId: updatedId,
                newText,
                version: newVersion,
                updatedBy,
                updatedByName,
                updatedAt
            }) => {
                console.log(`Translation updated by ${updatedByName} (${updatedBy}) to version ${newVersion}`);
                setVersion(newVersion);
                setHasUnsavedChanges(false);
            });

            socket.on('conflictDetected', ({
                translationId: conflictTranslationId,
                currentVersion,
                clientVersion,
                serverText
            }) => {
                console.log('Conflict detected:', { currentVersion, clientVersion });
                setConflictData({
                    translationId: conflictTranslationId,
                    currentVersion,
                    clientVersion,
                    serverText
                });
            });

            socket.on('editConfirmed', ({ translationId: confirmedId, version: confirmedVersion }) => {
                console.log(`Edit confirmed for version ${confirmedVersion}`);
                setVersion(confirmedVersion);
                setHasUnsavedChanges(false);
            });

            socket.on('error', ({ message }) => {
                console.error('Collaboration error:', message);
                setConnectionError(message);
            });

            return socket;
        };

        const socket = connectSocket();

        // Cleanup
        return () => {
            console.log('Cleaning up collaboration connection');
            if (socket) {
                socket.emit('leaveTranslation', translationId);
                socket.disconnect();
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [translationId, serverUrl]);

    // Start typing indicator
    const handleStartTyping = useCallback(() => {
        if (!socketRef.current || !isConnected || isTypingRef.current || !translationId) {
            console.log('Cannot start typing - not connected or already typing');
            return;
        }

        console.log('Starting typing indicator');
        setIsTyping(true);
        isTypingRef.current = true;
        socketRef.current.emit('startTyping', translationId);
    }, [translationId, isConnected]);

    // Stop typing indicator
    const handleStopTyping = useCallback(() => {
        if (!socketRef.current || !isConnected || !isTypingRef.current || !translationId) {
            console.log('Cannot stop typing - not connected or not typing');
            return;
        }

        console.log('Stopping typing indicator');
        setIsTyping(false);
        isTypingRef.current = false;
        socketRef.current.emit('stopTyping', translationId);
    }, [translationId, isConnected]);

    // Handle text change with typing indicators and auto-save
    const handleTextChange = useCallback((newText, options = {}) => {
        if (!translationId) {
            console.log('Cannot handle text change - no translation ID');
            return;
        }

        const { autoSave = true, saveDelay = 2000 } = options;

        console.log('Text changed:', newText.substring(0, 50) + (newText.length > 50 ? '...' : ''));
        setHasUnsavedChanges(true);

        // Start typing if not already
        if (!isTypingRef.current) {
            handleStartTyping();
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 1500); // Slightly longer timeout for better UX

        // Auto-save with debounce
        if (autoSave) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                handleSaveTranslation(newText);
            }, saveDelay);
        }

        // Emit real-time text change (for operational transform)
        if (socketRef.current && isConnected) {
            socketRef.current.emit('textChange', {
                translationId,
                delta: { text: newText, length: newText.length },
                version
            });
        }
    }, [translationId, version, isConnected, handleStartTyping, handleStopTyping]);

    // Save translation
    const handleSaveTranslation = useCallback((textToSave) => {
        if (!socketRef.current || !isConnected || !textToSave || !translationId) {
            console.warn('Cannot save: socket not connected, no text provided, or no translation ID');
            return;
        }

        console.log('Saving translation:', textToSave.substring(0, 50) + (textToSave.length > 50 ? '...' : ''));
        socketRef.current.emit('editTranslation', {
            translationId,
            newText: textToSave,
            version
        });
    }, [translationId, version, isConnected]);

    // Handle conflict resolution
    const handleResolveConflict = useCallback((action, newText = null) => {
        console.log('Resolving conflict:', action);

        if (action === 'accept-server' && conflictData) {
            setVersion(conflictData.currentVersion);
            setHasUnsavedChanges(false);
        } else if (action === 'keep-local' && newText) {
            handleSaveTranslation(newText);
        }

        setConflictData(null);
    }, [conflictData, handleSaveTranslation]);

    // Force stop typing (useful for cleanup)
    const forceStopTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        handleStopTyping();
    }, [handleStopTyping]);

    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (socketRef.current) {
            console.log('Manual reconnect requested');
            reconnectAttempts.current = 0;
            socketRef.current.connect();
        }
    }, []);

    // Get connection status text
    const getConnectionStatus = useCallback(() => {
        if (isConnected) return 'Connected';
        if (connectionError) {
            if (connectionError.includes('Authentication')) return 'Authentication Failed';
            return 'Connection Error';
        }
        return 'Connecting...';
    }, [isConnected, connectionError]);

    return {
        // Connection state
        isConnected,
        connectionError,
        connectionStatus: getConnectionStatus(),

        // User state
        activeUsers,
        typingUsers,
        isTyping,

        // Edit state
        hasUnsavedChanges,
        version,
        conflictData,

        // Methods
        handleTextChange,
        handleSaveTranslation,
        handleResolveConflict,
        handleStartTyping,
        handleStopTyping,
        forceStopTyping,
        reconnect
    };
};