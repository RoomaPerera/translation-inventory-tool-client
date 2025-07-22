import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Eye, X } from 'lucide-react';

const VersionHistory = ({
    translationId,
    currentText,
    onRevert,
    onClose,
    className = ""
}) => {
    const [revisions, setRevisions] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch revisions on component mount
    useEffect(() => {
        fetchRevisions();
    }, [translationId]);

    // Fetch diff when hovering over a revision
    useEffect(() => {
        if (hoveredIndex !== null) {
            fetchDiff(hoveredIndex);
        } else {
            setDiff(null);
        }
    }, [hoveredIndex]);

    const fetchRevisions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/translations/revisions/${translationId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch revisions');

            const data = await response.json();
            setRevisions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiff = async (revIndex) => {
        try {
            const response = await fetch(`/api/translations/diff/${translationId}/${revIndex}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch diff');

            const diffData = await response.json();
            setDiff(diffData);
        } catch (err) {
            console.error('Error fetching diff:', err);
        }
    };

    const handleRevert = async (revIndex) => {
        try {
            const response = await fetch(`/api/translations/revert/${translationId}/${revIndex}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to revert');

            const result = await response.json();
            onRevert(result.newText);
            fetchRevisions(); // Refresh revisions after revert
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderDiff = (index) => {
        if (hoveredIndex !== index || !diff) return null;

        return (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Comparison with Current
                </h4>
                <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
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
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Version History
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center text-gray-500">Loading revisions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Version History
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg border max-w-md ${className}`}>
            <div className="flex items-center justify-between p-4 border-b bg-purple-600">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Version History
                </h3>
                <button
                    onClick={onClose}
                    className="text-purple-200 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4">
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
                    <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {currentText}
                    </div>
                </div>

                {/* Revision History */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Previous Versions</h4>

                    {revisions.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-4">
                            No previous versions available
                        </div>
                    ) : (
                        revisions.map((revision, index) => (
                            <div key={index} className="space-y-0">
                                <div
                                    className={`p-3 border rounded-lg transition-all cursor-pointer ${hoveredIndex === index
                                        ? 'border-purple-400 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to revert to this version?')) {
                                            handleRevert(index);
                                        }
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
                                            {hoveredIndex === index && (
                                                <div className="flex items-center gap-1 text-purple-600">
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span className="text-xs">Click to revert</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 line-clamp-1">
                                        {revision.text}
                                    </div>
                                </div>

                                {/* Diff Display - appears right under the hovered item */}
                                {renderDiff(index)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistory;