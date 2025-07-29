import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Eye, AlertCircle, X } from 'lucide-react';
import revisionService from '../../services/revisionService';

// Revert Confirmation Modal Component
const RevertConfirmationModal = ({ isOpen, onClose, onConfirm, revision, revIndex, isReverting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl border max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-brand-purple-base" />
                            Confirm Version Revert
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isReverting}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to revert to this version? Your current changes will be saved as a new revision.
                        </p>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-medium text-gray-800 mb-2">
                                Reverting to Version {revIndex !== null ? `${revision?.length - revIndex}` : ''}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                                Created {revision?.createdAt ? new Date(revision.createdAt).toLocaleString() : ''}
                                by {revision?.author?.userName || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-700 bg-white border rounded p-2 max-h-24 overflow-y-auto">
                                {revision?.text || 'No text available'}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isReverting}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isReverting}
                            className="px-4 py-2 bg-brand-purple-base text-white rounded-md hover:bg-brand-purple-base/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isReverting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Reverting...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="w-4 h-4" />
                                    Revert to This Version
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VersionHistory = ({
    translationId,
    currentText,
    onRevert,
    className = ""
}) => {
    const [revisions, setRevisions] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reverting, setReverting] = useState(null);
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [selectedRevisionIndex, setSelectedRevisionIndex] = useState(null);
    const [diffLoading, setDiffLoading] = useState(false);

    // Refs for managing timeouts and cleanup
    const hoverTimeoutRef = useRef(null);
    const diffTimeoutRef = useRef(null);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            if (diffTimeoutRef.current) {
                clearTimeout(diffTimeoutRef.current);
            }
        };
    }, []);

    // Fetch revisions on component mount or when translation ID changes
    useEffect(() => {
        if (translationId) {
            fetchRevisions();
        }
    }, [translationId]);

    // Handle diff fetching with debouncing
    useEffect(() => {
        // Clear existing timeout
        if (diffTimeoutRef.current) {
            clearTimeout(diffTimeoutRef.current);
        }

        if (hoveredIndex !== null && translationId) {
            // Add a 800ms delay before fetching diff
            diffTimeoutRef.current = setTimeout(() => {
                fetchDiff(hoveredIndex);
            }, 800);
        } else {
            setDiff(null);
            setDiffLoading(false);
        }

        // Cleanup function
        return () => {
            if (diffTimeoutRef.current) {
                clearTimeout(diffTimeoutRef.current);
            }
        };
    }, [hoveredIndex, translationId]);

    const fetchRevisions = async () => {
        if (!translationId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await revisionService.getRevisions(translationId);
            setRevisions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching revisions:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch revisions');
            setRevisions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiff = async (revIndex) => {
        try {
            setDiffLoading(true);
            const diffData = await revisionService.getDiff(translationId, revIndex);
            setDiff(diffData);
        } catch (err) {
            console.error('Error fetching diff:', err);
            setDiff(null);
        } finally {
            setDiffLoading(false);
        }
    };

    const handleHoverStart = (index) => {
        // Clear any existing hover timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Set new hover timeout for 300ms delay
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredIndex(index);
        }, 300);
    };

    const handleHoverEnd = () => {
        // Clear hover timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Add slight delay before hiding diff to prevent flickering
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredIndex(null);
        }, 200);
    };

    const handleDiffHover = () => {
        // Keep diff visible when hovering over it
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const handleDiffLeave = () => {
        // Hide diff when leaving the diff area
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredIndex(null);
        }, 200);
    };

    const handleRevertClick = (revision, index) => {
        if (reverting !== null) return;

        setSelectedRevision(revision);
        setSelectedRevisionIndex(index);
        setShowRevertModal(true);
    };

    const handleRevertConfirm = async () => {
        if (!selectedRevision || selectedRevisionIndex === null) return;

        try {
            setReverting(selectedRevisionIndex);
            setError(null);

            const result = await revisionService.revertRevision(translationId, selectedRevisionIndex);

            // Call the parent component's onRevert callback
            if (onRevert) {
                onRevert(result.newText);
            }

            // Refresh revisions to show the new state
            await fetchRevisions();

            // Clear hover state
            setHoveredIndex(null);
            setShowRevertModal(false);
            setSelectedRevision(null);
            setSelectedRevisionIndex(null);

        } catch (err) {
            console.error('Error reverting revision:', err);
            setError(err.response?.data?.error || err.message || 'Failed to revert revision');
        } finally {
            setReverting(null);
        }
    };

    const handleRevertCancel = () => {
        setShowRevertModal(false);
        setSelectedRevision(null);
        setSelectedRevisionIndex(null);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (err) {
            return 'Invalid date';
        }
    };

    const renderDiff = (index) => {
        if (hoveredIndex !== index) return null;

        if (diffLoading) {
            return (
                <div
                    className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    onMouseEnter={handleDiffHover}
                    onMouseLeave={handleDiffLeave}
                >
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Loading changes...
                    </h4>
                    <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-purple-base rounded-full animate-spin"></div>
                    </div>
                </div>
            );
        }

        if (!diff || !Array.isArray(diff)) return null;

        return (
            <div
                className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                onMouseEnter={handleDiffHover}
                onMouseLeave={handleDiffLeave}
            >
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Changes from this version
                </h4>
                <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {diff.map((part, idx) => (
                        <span
                            key={idx}
                            className={`${part.added
                                ? 'bg-green-100 text-green-800'
                                : part.removed
                                    ? 'bg-red-100 text-red-800 line-through'
                                    : 'text-gray-700'
                                }`}
                        >
                            {part.value}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Version History
                    </h3>
                </div>
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-base mx-auto mb-4"></div>
                    Loading revisions...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Version History
                    </h3>
                </div>
                <div className="text-center text-red-500 py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchRevisions}
                        className="mt-4 px-4 py-2 bg-brand-purple-base text-white rounded hover:bg-brand-purple-base/80 transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`bg-white rounded-lg shadow-lg border max-w-md ${className}`}>
                {/* Header */}
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Version History
                    </h3>
                </div>

                {/* Scrollable Content */}
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: '400px' }}
                >
                    <div className="p-4 space-y-4">
                        {/* Current Version */}
                        <div className="p-3 bg-gray-50 border-l-4 border-brand-purple-base rounded-r-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800 text-sm">Current Version</div>
                                    <div className="text-gray-600 text-xs">Active now</div>
                                </div>
                                <div className="bg-brand-purple-base/10 text-brand-purple-base text-xs px-2 py-1 rounded-full">
                                    Latest
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                                {currentText || 'No text available'}
                            </div>
                        </div>

                        {/* Previous Versions Header */}
                        <h4 className="text-sm font-medium text-gray-600">Previous Versions</h4>

                        {/* Revisions List */}
                        {revisions.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-8">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                No previous versions available
                            </div>
                        ) : (
                            revisions.map((revision, index) => (
                                <div key={`${revision._id || index}-${revision.createdAt}`} className="mb-4">
                                    <div
                                        className={`p-3 border rounded-lg transition-all cursor-pointer ${hoveredIndex === index
                                            ? 'border-brand-purple-base bg-brand-purple-base/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            } ${reverting === index ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        onMouseEnter={() => !reverting && handleHoverStart(index)}
                                        onMouseLeave={() => !reverting && handleHoverEnd()}
                                        onClick={() => {
                                            if (reverting === index) return;
                                            handleRevertClick(revision, index);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-gray-800">
                                                        Version {revisions.length - index}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(revision.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    by {revision.author?.userName || 'Unknown'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {reverting === index ? (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-purple-base rounded-full animate-spin"></div>
                                                        <span className="text-xs">Reverting...</span>
                                                    </div>
                                                ) : hoveredIndex === index ? (
                                                    <div className="flex items-center gap-1 text-brand-purple-base">
                                                        <RotateCcw className="w-4 h-4" />
                                                        <span className="text-xs">Click to revert</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {revision.text || 'No text available'}
                                        </div>
                                    </div>

                                    {/* Diff Display */}
                                    {renderDiff(index)}
                                </div>
                            ))
                        )}

                        {/* Bottom padding to ensure all content is accessible */}
                        <div style={{ height: '100px' }}></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t bg-gray-50 text-xs text-gray-500">
                    <p>Hover to see changes, click to revert. Current changes will be saved automatically.</p>
                </div>
            </div>

            {/* Revert Confirmation Modal */}
            <RevertConfirmationModal
                isOpen={showRevertModal}
                onClose={handleRevertCancel}
                onConfirm={handleRevertConfirm}
                revision={selectedRevision}
                revIndex={selectedRevisionIndex}
                isReverting={reverting !== null}
            />
        </>
    );
};

export default VersionHistory;