import React, { useState, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce"; // Import the debounce hook
import TranslationHelper from "./home/TranslationHelper"; // Import the helper panel
import nlpService from "../services/nlpService";
import translationService from "../services/translationService";
import { useAuthContext } from '../hooks/useAuthContext';
import { useCollaboration } from '../hooks/useCollaboration';
import {
    ConnectionStatus,
    ActiveUsers,
    TypingIndicator,
    ConflictModal,
    SaveIndicator,
} from "./CollaborationComponents/CollaborationIndicators";
import "../styles/modal.css";

const EditTranslationModal = ({
    isOpen,
    onClose,
    onSave,
    translation,
    currentUser,
    userService,
}) => {
    // Form state, pre-filled from the `translation` prop
    const [formData, setFormData] = useState({
        translationKey: "",
        translatedText: "",
        status: "pending",
        product: "",
        language: "",
    });

    // State for the Translation Helper
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingNlp, setIsLoadingNlp] = useState(false);

    // We will debounce the `translationKey` from our form's state
    const debouncedKey = useDebounce(formData.translationKey, 500);

    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Collaboration state
    const [isConnected, setIsConnected] = useState(true);
    const [connectionError, setConnectionError] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [conflictData, setConflictData] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);

    // Refs for collaboration
    const wsRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastSavedData = useRef({});

    // Role-based permissions
    const canEditMetadata =
        currentUser?.role === "admin" || currentUser?.role === "developer";
    const canEditTranslation = ["admin", "developer", "translator"].includes(
        currentUser?.role
    );

    // Effect to populate the form when the modal opens or the `translation` prop changes
    useEffect(() => {
        if (translation) {
            const newFormData = {
                translationKey: translation.translationKey || "",
                translatedText: translation.translatedText || "",
                status: translation.status || "pending",
                product: translation.product || "Rubix",
                language: translation.language || "",
            };
            setFormData(newFormData);
            lastSavedData.current = { ...newFormData };
            setHasUnsavedChanges(false);

            // Clear old NLP results when a new translation is loaded
            setSuggestions([]);

            // Initialize WebSocket connection for collaboration
            if (translation._id) {
                initializeWebSocket(translation._id);
            }
        }
    }, [translation]);

    // Effect to fetch NLP data when the debounced source text (`translationKey`) changes
    useEffect(() => {
        if (debouncedKey) {
            const fetchNlpData = async () => {
                setIsLoadingNlp(true);
                try {
                    const suggestRes = await nlpService.getSuggestions(
                        debouncedKey,
                        formData.product
                    );
                    setSuggestions(suggestRes.data.suggestions || []);
                } catch (nlpError) {
                    console.error("Failed to fetch NLP data:", nlpError);
                    setSuggestions([]);
                } finally {
                    setIsLoadingNlp(false);
                }
            };
            fetchNlpData();
        } else {
            setSuggestions([]);
        }
    }, [debouncedKey, formData.product]);

    // Check for unsaved changes
    useEffect(() => {
        const hasChanges =
            JSON.stringify(formData) !== JSON.stringify(lastSavedData.current);
        setHasUnsavedChanges(hasChanges);
    }, [formData]);

    // Initialize WebSocket connection
    const initializeWebSocket = (translationId) => {
        try {
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//${window.location.host}/ws/translation/${translationId}`;

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setConnectionError("");
                // Join the collaboration session
                wsRef.current.send(
                    JSON.stringify({
                        type: "join",
                        userId: currentUser?.id,
                        translationId,
                    })
                );
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                setConnectionError("Connection lost");
            };

            wsRef.current.onerror = (error) => {
                setIsConnected(false);
                setConnectionError("Connection error");
            };
        } catch (error) {
            console.error("Failed to initialize WebSocket:", error);
            setIsConnected(false);
            setConnectionError("Failed to connect");
        }
    };

    // Handle WebSocket messages
    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case "users-updated":
                setActiveUsers(data.users || []);
                break;
            case "typing-start":
                setTypingUsers((prev) => [
                    ...prev.filter((id) => id !== data.userId),
                    data.userId,
                ]);
                break;
            case "typing-stop":
                setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
                break;
            case "translation-updated":
                if (data.userId !== currentUser?.id) {
                    // Check for conflicts
                    if (hasUnsavedChanges) {
                        setConflictData(data);
                    } else {
                        // Apply remote changes
                        setFormData((prevData) => ({
                            ...prevData,
                            translatedText: data.translatedText,
                        }));
                        lastSavedData.current.translatedText = data.translatedText;
                    }
                }
                break;
        }
    };

    // Cleanup WebSocket on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Role-based field restrictions
        if (
            (name === "translationKey" || name === "language") &&
            !canEditMetadata
        ) {
            return; // Prevent editing if user doesn't have permission
        }

        if (name === "translatedText" && !canEditTranslation) {
            return; // Prevent editing if user doesn't have permission
        }

        setFormData({ ...formData, [name]: value });

        // Handle typing indicators for translation text
        if (
            name === "translatedText" &&
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
        ) {
            setIsCurrentUserTyping(true);

            // Send typing start
            wsRef.current.send(
                JSON.stringify({
                    type: "typing-start",
                    userId: currentUser?.id,
                    translationId: translation._id,
                })
            );

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to send typing stop
            typingTimeoutRef.current = setTimeout(() => {
                setIsCurrentUserTyping(false);
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                        JSON.stringify({
                            type: "typing-stop",
                            userId: currentUser?.id,
                            translationId: translation._id,
                        })
                    );
                }
            }, 1000);
        }
    };

    const handleSuggestionClick = (text) => {
        setFormData({ ...formData, translatedText: text });
    };

    const handleVersionRevert = (newText) => {
        setFormData({ ...formData, translatedText: newText });
    };

    const handleConflictResolve = (resolution, localText = null) => {
        if (resolution === "accept-server") {
            setFormData((prevData) => ({
                ...prevData,
                translatedText: conflictData.translatedText,
            }));
            lastSavedData.current.translatedText = conflictData.translatedText;
            setHasUnsavedChanges(false);
        } else if (resolution === "keep-local") {
        }
        setConflictData(null);
    };

    const handleSaveChanges = async () => {
        if (!hasUnsavedChanges) return;

        setError("");
        setIsSaving(true);

        const updateData = {
            translatedText: formData.translatedText,
            status: formData.status,
        };

        // Add metadata fields if user has permission
        if (canEditMetadata) {
            updateData.translationKey = formData.translationKey;
            updateData.language = formData.language;
        }

        try {
            await translationService.updateTranslation(translation._id, updateData);
            lastSavedData.current = { ...formData };
            setHasUnsavedChanges(false);

            // Broadcast changes to other users
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                    JSON.stringify({
                        type: "translation-updated",
                        userId: currentUser?.id,
                        translationId: translation._id,
                        translatedText: formData.translatedText,
                    })
                );
            }

            onSave();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update translation.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleSaveChanges();
        onClose();
    };

    const modalStyle = {
        width: "900px",
        maxWidth: "95vw",
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2>Edit Translation</h2>
                        <div className="subtitle">
                            {formData.product}: {translation?.translationKey} (
                            {translation?.language?.toUpperCase()})
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ConnectionStatus
                            isConnected={isConnected}
                            connectionError={connectionError}
                        />
                        <button onClick={onClose} className="modal-close-button">
                            ×
                        </button>
                    </div>
                </div>

                {/* Active Users - positioned right below header */}
                {activeUsers.length > 0 && (
                    <div className="px-6 py-2 border-b bg-gray-50">
                        <ActiveUsers
                            users={activeUsers}
                            currentUserId={currentUser?.id}
                            userService={userService}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Column 1: The Form */}
                    <div className="modal-body !p-0">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="space-y-5">
                                {/* The translation key - editable only for admin/developer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Translation Key (Source Text)
                                        {!canEditMetadata && (
                                            <span className="text-xs text-gray-400 ml-2">
                                                (Read-only)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="translationKey"
                                        value={formData.translationKey}
                                        onChange={handleChange}
                                        readOnly={!canEditMetadata}
                                        className={`w-full p-2 border-b-2 ${canEditMetadata
                                            ? "border-gray-300 focus:outline-none focus:border-brand-purple-base"
                                            : "bg-gray-100 border-gray-300 cursor-not-allowed"
                                            }`}
                                    />
                                </div>

                                {/* Language field - editable only for admin/developer */}
                                {canEditMetadata && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Language
                                        </label>
                                        <input
                                            type="text"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base"
                                        />
                                    </div>
                                )}

                                {/* Typing Indicator - positioned above textarea */}
                                <TypingIndicator
                                    typingUsers={typingUsers}
                                    currentUserId={currentUser?.id}
                                    userService={userService}
                                />

                                <div className="relative">
                                    <textarea
                                        name="translatedText"
                                        placeholder={
                                            canEditTranslation
                                                ? "Translated Text"
                                                : "You don't have permission to edit translations"
                                        }
                                        rows="4"
                                        value={formData.translatedText}
                                        onChange={handleChange}
                                        readOnly={!canEditTranslation}
                                        className={`w-full p-2 border-b-2 ${canEditTranslation
                                            ? "border-gray-300 focus:outline-none focus:border-brand-purple-base"
                                            : "bg-gray-100 border-gray-300 cursor-not-allowed"
                                            }`}
                                        required
                                    />
                                    {!canEditTranslation && (
                                        <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center">
                                            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded shadow">
                                                Editing restricted to your role
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full p-2 border bg-white rounded-md border-gray-300 focus:outline-none focus:border-brand-purple-base"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                    </select>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                            <div className="flex justify-between items-center mt-auto pt-6">
                                {/* Save Indicator - positioned on the left */}
                                <SaveIndicator
                                    hasUnsavedChanges={hasUnsavedChanges}
                                    onSave={handleSaveChanges}
                                    isTyping={isCurrentUserTyping}
                                />

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="py-2 px-5 rounded-md border text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !canEditTranslation}
                                        className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50"
                                    >
                                        {isSaving ? "Saving..." : "Save & Close"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Column 2: The Helper Panel */}
                    <div>
                        <TranslationHelper
                            suggestions={suggestions}
                            translationId={translation?._id}
                            currentText={formData.translatedText}
                            onSuggestionClick={handleSuggestionClick}
                            onVersionRevert={handleVersionRevert}
                            isLoading={isLoadingNlp}
                        />
                    </div>
                </div>

                {/* Conflict Resolution Modal */}
                <ConflictModal
                    conflictData={conflictData}
                    onResolve={handleConflictResolve}
                    currentText={formData.translatedText}
                />
            </div>
        </div>
    );
};

export default EditTranslationModal;
