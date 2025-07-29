import React, { useState, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import nlpService from "../services/nlpService";
import translationService from "../services/translationService";
import { useCollaboration } from "../hooks/useCollaboration";
import VersionHistory from "./TranslationComponents/VersionHistory";
import {
    ConnectionStatus,
    ActiveUsers,
    ConflictModal,
} from "./CollaborationComponents/CollaborationIndicators";
import "../styles/modal.css";

const EditTranslationModal = ({
    isOpen,
    onClose,
    onSave,
    translation,
    projects = [],
    currentUser,
    userService,
}) => {
    // Form state
    const [formData, setFormData] = useState({
        translationKey: "",
        translatedText: "",
        status: "pending",
        product: "",
        language: "",
    });

    // State for suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingNlp, setIsLoadingNlp] = useState(false);
    const debouncedKey = useDebounce(formData.translationKey, 500);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // State for tab navigation
    const [activeTab, setActiveTab] = useState("edit");

    // Use the collaboration hook only when we have a translation ID
    const collaborationEnabled = translation?._id && isOpen;
    const collaboration = useCollaboration({
        translationId: collaborationEnabled ? translation._id : null,
    });

    // extract values from collaboration hook
    const {
        isConnected,
        connectionError,
        activeUsers,
        typingUsers,
        isTyping,
        hasUnsavedChanges: collaborationUnsavedChanges,
        conflictData,
        handleTextChange,
        handleSaveTranslation,
        handleResolveConflict,
        handleStartTyping,
        handleStopTyping,
    } = collaboration || {
        isConnected: false,
        connectionError: null,
        activeUsers: [],
        typingUsers: [],
        isTyping: false,
        hasUnsavedChanges: false,
        conflictData: null,
        handleTextChange: () => { },
        handleSaveTranslation: () => { },
        handleResolveConflict: () => { },
        handleStartTyping: () => { },
        handleStopTyping: () => { },
    };

    const lastSavedData = useRef({});
    const typingTimeoutRef = useRef(null);

    // Role-based permissions
    const canEditTranslationKey = currentUser?.role !== "translator";
    const canEditTranslation = true;

    // Effect to populate the form when the modal opens
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
            setActiveTab("edit"); // Reset to edit tab when modal opens
            setSuggestions([]);
        }
    }, [translation]);

    // Effect to fetch NLP data - only when on edit tab
    useEffect(() => {
        if (debouncedKey && activeTab === "edit") {
            const fetchNlpData = async () => {
                setIsLoadingNlp(true);
                try {
                    const suggestRes = await nlpService.getSuggestions(
                        debouncedKey,
                        formData.product,
                        translation.projectId
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
    }, [debouncedKey, formData.product, translation?.projectId, activeTab]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Role-based restrictions
        if (name === "translationKey" && !canEditTranslationKey) {
            return;
        }

        if (name === "translatedText" && !canEditTranslation) {
            return;
        }

        setFormData({ ...formData, [name]: value });

        // Handle typing indicators specifically for translation text
        if (name === "translatedText" && collaborationEnabled) {
            // Start typing indicator
            handleStartTyping();

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                handleStopTyping();
            }, 1000);

            // Handle text change for collaboration
            handleTextChange(value, { autoSave: false });
        }
    };

    const handleSuggestionClick = (text) => {
        setFormData({ ...formData, translatedText: text });
        if (collaborationEnabled) {
            handleTextChange(text, { autoSave: false });
        }
    };

    const handleVersionRevert = (newText) => {
        setFormData({ ...formData, translatedText: newText });
        if (collaborationEnabled) {
            handleTextChange(newText, { autoSave: false });
        }
    };

    const handleConflictResolve = (resolution, localText = null) => {
        if (resolution === "accept-server") {
            handleResolveConflict("accept-server", null);
            // Update form with server text
            setFormData(prev => ({
                ...prev,
                translatedText: conflictData.serverText
            }));
        } else if (resolution === "keep-local") {
            handleResolveConflict("keep-local", formData.translatedText);
        }
    };

    // Calculate if there are unsaved changes
    const hasUnsavedChanges = collaborationUnsavedChanges || JSON.stringify(formData) !== JSON.stringify(lastSavedData.current);

    const handleSaveChanges = async () => {
        if (!hasUnsavedChanges) return;

        setError("");
        setIsSaving(true);

        const updateData = {
            translatedText: formData.translatedText,
            status: formData.status,
            language: formData.language,
        };

        if (canEditTranslationKey) {
            updateData.translationKey = formData.translationKey;
        }

        // Only allow status updates for Admin/Developer roles
        if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Developer')) {
            updateData.status = formData.status;
        }

        try {
            await translationService.updateTranslation(translation._id, updateData);
            lastSavedData.current = { ...formData };

            // Save through collaboration system
            handleSaveTranslation(formData.translatedText);

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

    // Get typing users for translation field specifically
    const translationFieldTypingUsers = typingUsers.filter(userId => userId !== currentUser?.id);

    const modalStyle = {
        width: "900px",
        maxWidth: "95vw",
        height: "600px", // Fixed height to prevent resizing
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
    };

    if (!isOpen) return null;

    const currentProject = projects.find(p => p._id === translation?.projectId) || null;

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
                            {currentProject ? currentProject.name : 'Unknown Project'} | {translation?.language?.toUpperCase() || 'Unknown'}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {collaborationEnabled && (
                            <ConnectionStatus
                                isConnected={isConnected}
                                connectionError={connectionError}
                            />
                        )}
                        <button onClick={onClose} className="modal-close-button">
                            ×
                        </button>
                    </div>
                </div>

                {/* Active Users - only show if collaboration is enabled */}
                {collaborationEnabled && activeUsers.length > 0 && (
                    <div className="border-b bg-gray-50">
                        <ActiveUsers
                            users={activeUsers}
                            currentUserId={currentUser?.id}
                            userService={userService}
                        />
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "edit"
                            ? "border-brand-purple-base text-brand-purple-base"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Edit Translation
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "history"
                            ? "border-brand-purple-base text-brand-purple-base"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Version History
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "edit" ? (
                    // Edit Translation Tab Content
                    <div className="grid grid-cols-2 gap-6 p-6 flex-1 overflow-hidden">
                        {/* Column 1: The Form */}
                        <div className="modal-body !p-0 flex flex-col h-full">
                            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                                <div className="space-y-5 flex-1 overflow-y-auto">
                                    {/* Translation key */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Translation Key (Source Text)
                                            {!canEditTranslationKey && (
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Read-only for translators)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            name="translationKey"
                                            value={formData.translationKey}
                                            readOnly
                                            className="w-full p-2 bg-gray-100 border-b-2 border-gray-300"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Translation Text
                                        </label>

                                        {collaborationEnabled && translationFieldTypingUsers.length > 0 && (
                                            <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                    <span className="text-sm text-blue-700">
                                                        {translationFieldTypingUsers.map(userId => {
                                                            const user = activeUsers.find(u => u.id === userId);
                                                            return user?.userName || `User ${userId.slice(-4)}`;
                                                        }).join(', ')}
                                                        {translationFieldTypingUsers.length === 1 ? ' is' : ' are'} typing in this field...
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <textarea
                                            name="translatedText"
                                            placeholder="Enter your translation here..."
                                            rows="1"
                                            value={formData.translatedText}
                                            onChange={handleChange}
                                            className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base resize-none"
                                            required
                                        />

                                        {/* Show if current user is typing - only if collaboration enabled */}
                                        {collaborationEnabled && isTyping && (
                                            <div className="absolute -bottom-6 left-0 flex items-center space-x-1 text-xs text-gray-500">
                                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-ping" />
                                                <span>You're typing...</span>
                                            </div>
                                        )}
                                    </div>

                                    {currentUser && (
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
                                    )}

                                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                                </div>

                                {/* Save buttons - fixed at bottom */}
                                <div className="flex justify-end items-center pt-6 border-t bg-white">
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
                                            disabled={isSaving}
                                            className="py-2 px-5 rounded-md bg-brand-purple-base text-white font-semibold transition hover:bg-opacity-80 disabled:bg-opacity-50"
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Column 2: Suggestions Panel */}
                        <div className="flex flex-col gap-4">
                            <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 h-full">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                                    Translation Suggestions
                                </h3>
                                {isLoadingNlp && <p className="text-sm text-gray-500">Fetching suggestions...</p>}
                                {!isLoadingNlp && (
                                    <div>
                                        {suggestions.length > 0 ? (
                                            <ul className="space-y-2">
                                                {suggestions.map((s, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => handleSuggestionClick(s.translatedText)}
                                                        className="p-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition"
                                                    >
                                                        <p className="text-sm text-gray-800">{s.translatedText}</p>
                                                        <p className="text-xs text-gray-500">
                                                            From "{s.sourceText}" (Similarity: {Math.round(s.similarity * 100)}%)
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400">No similar translations found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Version History Tab Content
                    <div className="p-6 flex-1 overflow-hidden">
                        <VersionHistory
                            translationId={translation?._id}
                            currentText={formData.translatedText}
                            onRevert={handleVersionRevert}
                            className="h-full"
                        />
                    </div>
                )}

                {/* Conflict Resolution Modal - only show if collaboration enabled */}
                {collaborationEnabled && (
                    <ConflictModal
                        conflictData={conflictData}
                        onResolve={handleConflictResolve}
                        currentText={formData.translatedText}
                    />
                )}
            </div>
        </div>
    );
};

export default EditTranslationModal;