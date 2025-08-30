import React from 'react';
import VersionHistory from '../TranslationComponents/VersionHistory';

/**
 * A panel that displays translation suggestions and version history.
 * @param {Array} suggestions - List of translation suggestion objects.
 * @param {string} translationId - ID of the current translation for version history.
 * @param {string} currentText - Current translation text for version history.
 * @param {Function} onSuggestionClick - Function to call when a suggestion is clicked.
 * @param {Function} onVersionRevert - Function to call when reverting to a version.
 * @param {boolean} isLoading - Whether the panel is currently fetching data.
 */
const TranslationHelper = ({
    suggestions,
    translationId,
    currentText,
    onSuggestionClick,
    onVersionRevert,
    isLoading
}) => {
    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Suggestions Section */}
            <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Translation Suggestions</h3>

                {/* Loading State */}
                {isLoading && <p className="text-sm text-gray-500">Fetching suggestions...</p>}

                {!isLoading && (
                    <div>
                        {suggestions.length > 0 ? (
                            <ul className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        onClick={() => onSuggestionClick(s.translatedText)}
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

            {/* Version History Section */}
            {translationId && (
                <div className="flex-1 min-h-0">
                    <VersionHistory
                        translationId={translationId}
                        currentText={currentText}
                        onRevert={onVersionRevert}
                        onClose={() => { }} // No close action needed in this context
                        className="h-full"
                    />
                </div>
            )}
        </div>
    );
};

export default TranslationHelper;