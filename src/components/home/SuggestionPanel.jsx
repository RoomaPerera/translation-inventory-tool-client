import React from 'react';

const SuggestionPanel = ({ suggestions, onSuggestionClick, isLoading }) => {
    return (
        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Translation Suggestions
            </h3>
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
    );
};

export default SuggestionPanel;