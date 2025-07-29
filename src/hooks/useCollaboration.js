// src/hooks/useCollaboration.js
import { useState, useEffect, useRef, useCallback } from 'react';
//import io from 'socket.io-client';

export const useCollaboration = ({
    translationId,
    authToken,
    serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'
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

    // Initialize socket connection
    useEffect(() => {
        if (!translationId || !authToken) return;

        const socket = io(serverUrl, {
            auth: { token: authToken },
            transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            setIsConnected(true);
            setConnectionError(null);
            console.log('Connected to collaboration server');

            // Join the translation room
            socket.emit('joinTranslation', translationId);
        });

        socket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('Disconnected from collaboration server:', reason);
        });

        socket.on('connect_error', (error) => {
            setConnectionError(error.message);
            setIsConnected(false);
            console.error('Connection error:', error);
        });

        // Collaboration event handlers
        socket.on('activeUsers', ({ users, typingUsers: currentTyping }) => {
            setActiveUsers(users);
            setTypingUsers(currentTyping);
        });

        socket.on('activeUsersUpdate', ({ activeUsers: updatedUsers }) => {
            setActiveUsers(updatedUsers);
        });

        socket.on('userJoined', ({ userId }) => {
            console.log(`User ${userId} joined the translation`);
        });

        socket.on('userLeft', ({ userId }) => {
            console.log(`User ${userId} left the translation`);
            // Remove from typing users if they were typing
            setTypingUsers(prev => prev.filter(id => id !== userId));
        });

        socket.on('userStartedTyping', ({ userId }) => {
            setTypingUsers(prev => [...new Set([...prev, userId])]);
        });

        socket.on('userStoppedTyping', ({ userId }) => {
            setTypingUsers(prev => prev.filter(id => id !== userId));
        });

        socket.on('textChanged', ({ userId, delta, version: remoteVersion, timestamp }) => {
            // Handle real-time text changes from other users
            // This would integrate with operational transform if implemented
            console.log(`Text changed by ${userId}:`, delta);
        });

        socket.on('translationUpdated', ({ translationId: updatedId, newText, version: newVersion, updatedBy }) => {
            // Handle final translation updates
            console.log(`Translation updated by ${updatedBy} to version ${newVersion}`);
            setVersion(newVersion);
            setHasUnsavedChanges(false);
        });

        socket.on('conflictDetected', ({ currentVersion, clientVersion, serverText }) => {
            setConflictData({
                currentVersion,
                clientVersion,
                serverText
            });
        });

        socket.on('editConfirmed', ({ version: confirmedVersion }) => {
            setVersion(confirmedVersion);
            setHasUnsavedChanges(false);
        });

        socket.on('error', ({ message }) => {
            console.error('Collaboration error:', message);
        });

        // Cleanup
        return () => {
            if (socket) {
                socket.emit('leaveTranslation', translationId);
                socket.disconnect();
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [translationId, authToken, serverUrl]);

    // Start typing indicator
    const handleStartTyping = useCallback(() => {
        if (!socketRef.current || isTyping) return;

        setIsTyping(true);
        socketRef.current.emit('startTyping', translationId);
    }, [translationId, isTyping]);

    // Stop typing indicator
    const handleStopTyping = useCallback(() => {
        if (!socketRef.current || !isTyping) return;

        setIsTyping(false);
        socketRef.current.emit('stopTyping', translationId);
    }, [translationId, isTyping]);

    // Handle text change with typing indicators and auto-save
    const handleTextChange = useCallback((newText, options = {}) => {
        const { autoSave = true, saveDelay = 2000 } = options;

        setHasUnsavedChanges(true);

        // Start typing if not already
        if (!isTyping) {
            handleStartTyping();
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 1000);

        // Auto-save with debounce
        if (autoSave) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                handleSaveTranslation(newText);
            }, saveDelay);
        }

        // Emit real-time text change
        if (socketRef.current) {
            socketRef.current.emit('textChange', {
                translationId,
                delta: { text: newText }, // Simplified delta
                version
            });
        }
    }, [translationId, version, isTyping, handleStartTyping, handleStopTyping]);

    // Save translation
    const handleSaveTranslation = useCallback((textToSave) => {
        if (!socketRef.current || !textToSave) return;

        socketRef.current.emit('editTranslation', {
            translationId,
            newText: textToSave,
            version
        });
    }, [translationId, version]);

    // Handle conflict resolution
    const handleResolveConflict = useCallback((action, newText) => {
        if (action === 'accept-server') {
            setVersion(conflictData.currentVersion);
        } else if (action === 'keep-local') {
            handleSaveTranslation(newText);
        }
        setConflictData(null);
    }, [conflictData, handleSaveTranslation]);

    return {
        // Connection state
        isConnected,
        connectionError,

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
        handleStopTyping
    };
};