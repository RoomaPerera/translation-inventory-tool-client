// src/hooks/useCollaboration.js
import { useState, useEffect, useRef, useCallback } from 'react';
//import io from 'socket.io-client';

export const useCollaboration = ({
    translationId,
    serverUrl = (() => {
        const serverUrl = import.meta.env.VITE_SERVER_URL ||
            import.meta.env.VITE_API_BASE_URL ||
            import.meta.env.VITE_REACT_APP_SERVER_URL ||
            'http://localhost:5000';

        console.log('Using server URL:', serverUrl);
        return serverUrl;
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
    const [transportType, setTransportType] = useState('polling');

    // Refs
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);

    //Initialize socket connection
    useEffect(() => {
        if (!translationId) {
            console.log('No translation ID provided, skipping collaboration setup');
            return;
        }

        console.log('🔌 Initializing collaboration for translation:', translationId);

        const connectSocket = () => {
            //Enhanced Socket.IO configuration
            const socketConfig = {
                withCredentials: true,
                //Start with polling, allow upgrade to websocket
                transports: ['polling', 'websocket'],
                //timeouts for better stability
                timeout: 30000,
                //Reconnection settings
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                maxReconnectionAttempts: 5,
                //Polling options
                forceNew: false,
                rememberUpgrade: true,
                // upgrade handling
                upgrade: true,
                //Add query parameters for debugging
                query: {
                    translationId: translationId,
                    timestamp: Date.now()
                }
            };

            console.log('Connecting to:', serverUrl, 'with config:', socketConfig);
            const socket = io(serverUrl, socketConfig);

            socketRef.current = socket;

            // connection event handlers
            socket.on('connect', () => {
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                setTransportType(socket.io.engine.transport.name);

                console.log('Connected to collaboration server');
                console.log('Transport:', socket.io.engine.transport.name);
                console.log('Socket ID:', socket.id);

                // Join the translation room
                socket.emit('joinTranslation', translationId);
            });

            socket.on('disconnect', (reason) => {
                setIsConnected(false);
                setIsTyping(false);
                isTypingRef.current = false;
                console.log('Disconnected from collaboration server:', reason);

                // show error for unexpected disconnects
                if (reason === 'io server disconnect') {
                    setConnectionError('Server disconnected');
                } else if (reason === 'ping timeout') {
                    setConnectionError('Connection timeout');
                } else if (reason !== 'io client disconnect') {
                    setConnectionError(`Disconnected: ${reason}`);
                }
            });

            socket.on('connect_error', (error) => {
                const errorMessage = error.message || error.toString();
                setConnectionError(errorMessage);
                setIsConnected(false);

                console.error('Connection error:', {
                    message: errorMessage,
                    type: error.type,
                    description: error.description,
                    context: error.context,
                    transport: socket.io?.engine?.transport?.name
                });

                //Handle specific transport errors
                if (errorMessage.includes('websocket') || errorMessage.includes('TransportError')) {
                    console.log('WebSocket failed, Socket.IO should fallback to polling automatically');
                }

                //Implement exponential backoff for reconnection
                reconnectAttempts.current += 1;
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

                if (reconnectAttempts.current <= 5) {
                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (socketRef.current && socketRef.current.disconnected) {
                            console.log('Executing reconnection attempt...');
                            socketRef.current.connect();
                        }
                    }, delay);
                } else {
                    console.error('Max reconnection attempts reached');
                    setConnectionError('Unable to connect after multiple attempts');
                }
            });

            // Monitor transport upgrades
            socket.io.on('upgrade', () => {
                const newTransport = socket.io.engine.transport.name;
                console.log('⬆Upgraded to transport:', newTransport);
                setTransportType(newTransport);
            });

            socket.io.on('upgradeError', (error) => {
                console.warn('Transport upgrade failed:', error.message);
                console.log('Continuing with current transport:', socket.io.engine.transport.name);
            });

            //authentication handling
            socket.on('authenticated', ({ userId, userName, role }) => {
                console.log('Socket authenticated:', { userId, userName, role });
            });

            // Collaboration event handler
            socket.on('activeUsers', ({ users, typingUsers: currentTyping }) => {
                console.log('Received active users:', users?.length || 0, 'typing:', currentTyping?.length || 0);
                setActiveUsers(users || []);
                setTypingUsers(currentTyping || []);
            });

            socket.on('activeUsersUpdate', ({ activeUsers: updatedUsers }) => {
                console.log('Active users updated:', updatedUsers?.length || 0);
                setActiveUsers(updatedUsers || []);
            });

            socket.on('userJoined', ({ userId, userName, joinedAt }) => {
                console.log(`User ${userName} (${userId}) joined at ${joinedAt}`);
            });

            socket.on('userLeft', ({ userId, userName, leftAt }) => {
                console.log(`User ${userName} (${userId}) left at ${leftAt}`);
                setTypingUsers(prev => prev.filter(id => id !== userId));
            });

            socket.on('userStartedTyping', ({ userId, userName, timestamp }) => {
                console.log(`User ${userName} started typing at ${timestamp}`);
                setTypingUsers(prev => {
                    if (!prev.includes(userId)) {
                        return [...prev, userId];
                    }
                    return prev;
                });
            });

            socket.on('userStoppedTyping', ({ userId, userName, timestamp }) => {
                console.log(`User ${userName} stopped typing at ${timestamp}`);
                setTypingUsers(prev => prev.filter(id => id !== userId));
            });

            socket.on('textChanged', ({ userId, userName, delta, version: remoteVersion, timestamp }) => {
                console.log(`Text changed by ${userName}:`, { version: remoteVersion, timestamp });
            });

            socket.on('translationUpdated', ({
                translationId: updatedId,
                newText,
                version: newVersion,
                updatedBy,
                updatedByName,
                updatedAt
            }) => {
                console.log(`Translation updated by ${updatedByName} to version ${newVersion}`);
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
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (socket) {
                socket.emit('leaveTranslation', translationId);
                socket.removeAllListeners();
                socket.disconnect();
            }
        };
    }, [translationId, serverUrl]);

    const handleStartTyping = useCallback(() => {
        if (!socketRef.current || !isConnected || isTypingRef.current || !translationId) {
            return;
        }

        setIsTyping(true);
        isTypingRef.current = true;
        socketRef.current.emit('startTyping', translationId);
    }, [translationId, isConnected]);

    const handleStopTyping = useCallback(() => {
        if (!socketRef.current || !isConnected || !isTypingRef.current || !translationId) {
            return;
        }

        setIsTyping(false);
        isTypingRef.current = false;
        socketRef.current.emit('stopTyping', translationId);
    }, [translationId, isConnected]);

    const handleTextChange = useCallback((newText, options = {}) => {
        if (!translationId) return;

        const { autoSave = true, saveDelay = 2000 } = options;
        setHasUnsavedChanges(true);

        if (!isTypingRef.current) {
            handleStartTyping();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 1500);

        if (autoSave) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                handleSaveTranslation(newText);
            }, saveDelay);
        }

        if (socketRef.current && isConnected) {
            socketRef.current.emit('textChange', {
                translationId,
                delta: { text: newText, length: newText.length },
                version
            });
        }
    }, [translationId, version, isConnected, handleStartTyping, handleStopTyping]);

    const handleSaveTranslation = useCallback((textToSave) => {
        if (!socketRef.current || !isConnected || !textToSave || !translationId) {
            console.warn('Cannot save: socket not connected, no text provided, or no translation ID');
            return;
        }

        console.log('Saving translation...');
        socketRef.current.emit('editTranslation', {
            translationId,
            newText: textToSave,
            version
        });
    }, [translationId, version, isConnected]);

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

    const forceStopTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        handleStopTyping();
    }, [handleStopTyping]);

    const reconnect = useCallback(() => {
        if (socketRef.current) {
            console.log('Manual reconnect requested');
            reconnectAttempts.current = 0;
            setConnectionError(null);
            socketRef.current.connect();
        }
    }, []);

    const getConnectionStatus = useCallback(() => {
        if (isConnected) return `Connected (${transportType})`;
        if (connectionError) {
            if (connectionError.includes('Authentication')) return 'Authentication Failed';
            if (connectionError.includes('timeout')) return 'Connection Timeout';
            return 'Connection Error';
        }
        return 'Connecting...';
    }, [isConnected, connectionError, transportType]);

    return {
        // Connection state
        isConnected,
        connectionError,
        connectionStatus: getConnectionStatus(),
        transportType,

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