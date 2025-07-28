import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import revisionService from '../../services/revisionService';

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

    // Fetch revisions on component mount or when translation ID changes
    useEffect(() => {
        if (translationId) {
            fetchRevisions();
        }
    }, [translationId]);

    // Fetch diff when hovering over a revision
    useEffect(() => {
        if (hoveredIndex !== null && translationId) {
            fetchDiff(hoveredIndex);
        } else {
            setDiff(null);
        }
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
            const diffData = await revisionService.getDiff(translationId, revIndex);
            setDiff(diffData);
        } catch (err) {
            console.error('Error fetching diff:', err);
            setDiff(null);
        }
    };

    const handleRevert = async (revIndex) => {
        const revision = revisions[revIndex];
        if (!revision) return;

        const confirmMessage = `Are you sure you want to revert to this version?\n\nThis will restore:\n"${revision.text?.substring(0, 100)}${revision.text?.length > 100 ? '...' : ''}"\n\nYour current changes will be saved as a new revision.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setReverting(revIndex);
            setError(null);

            const result = await revisionService.revertRevision(translationId, revIndex);

            // Call the parent component's onRevert callback
            if (onRevert) {
                onRevert(result.newText);
            }

            // Refresh revisions to show the new state
            await fetchRevisions();

            // Clear hover state
            setHoveredIndex(null);

        } catch (err) {
            console.error('Error reverting revision:', err);
            setError(err.response?.data?.error || err.message || 'Failed to revert revision');
        } finally {
            setReverting(null);
        }
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
        if (hoveredIndex !== index || !diff || !Array.isArray(diff)) return null;

        return (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
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
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Version History
                    </h3>
                </div>
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    Loading revisions...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Version History
                    </h3>
                </div>
                <div className="text-center text-red-500 py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchRevisions}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg border max-w-md ${className}`}>
            <div className="p-4 border-b bg-purple-600">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Version History
                </h3>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
                {/* Current Version */}
                <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-purple-800 text-sm">Current Version</div>
                            <div className="text-purple-600 text-xs">Active now</div>
                        </div>
                        <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Latest
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 line-clamp-3">
                        {currentText || 'No text available'}
                    </div>
                </div>

                {/* Revision History */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Previous Versions</h4>

                    {revisions.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            No previous versions available
                        </div>
                    ) : (
                        revisions.map((revision, index) => (
                            <div key={`${revision._id || index}-${revision.createdAt}`} className="space-y-0">
                                <div
                                    className={`p-3 border rounded-lg transition-all cursor-pointer ${hoveredIndex === index
                                        ? 'border-purple-400 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        } ${reverting === index ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    onMouseEnter={() => !reverting && setHoveredIndex(index)}
                                    onMouseLeave={() => !reverting && setHoveredIndex(null)}
                                    onClick={() => {
                                        if (reverting === index) return;
                                        handleRevert(index);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
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
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                                                    <span className="text-xs">Reverting...</span>
                                                </div>
                                            ) : hoveredIndex === index ? (
                                                <div className="flex items-center gap-1 text-purple-600">
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span className="text-xs">Click to revert</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                                        {revision.text || 'No text available'}
                                    </div>
                                </div>

                                {/* Diff Display - appears right under the hovered item */}
                                {renderDiff(index)}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer with info */}
            <div className="p-3 border-t bg-gray-50 text-xs text-gray-500">
                <p>Click on any version to revert. Your current changes will be saved automatically.</p>
            </div>
        </div>
    );
};

export default VersionHistory;