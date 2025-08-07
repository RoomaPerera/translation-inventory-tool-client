// Updated FuzzySearchResults.jsx
import React from 'react';

const FuzzySearchResults = ({ 
    results = [], 
    onResultClick, 
    isLoading = false, 
    searchType = 'key',
    className = "" 
}) => {
    if (isLoading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
                    <span className="text-gray-600">Searching...</span>
                </div>
            </div>
        );
    }

    if (!results.length) {
        return null;
    }

    const getResultLabel = (result) => {
        switch (searchType) {
            case 'key':
                return result.translationKey;
            case 'text':
                return result.translatedText;
            case 'project':
                return result.product;
            case 'language':
                return result.language;
            default:
                return result.matchedField;
        }
    };

    const getResultSubtitle = (result) => {
        switch (searchType) {
            case 'key':
                return `${result.language?.toUpperCase()} • ${result.translatedText || 'No translation'}`;
            case 'text':
                return `${result.translationKey} • ${result.language?.toUpperCase()}`;
            case 'project':
                return `${result.translationKey} • ${result.language?.toUpperCase()}`;
            case 'language':
                return `${result.translationKey} • ${result.product}`;
            default:
                return `${result.translationKey} • ${result.language?.toUpperCase()}`;
        }
    };

    // Updated to handle new match types from enhanced backend
    const getSimilarityColor = (score, matchType) => {
        if (matchType === 'exact') return 'text-green-600 bg-green-100';
        if (matchType === 'starts-with') return 'text-emerald-600 bg-emerald-100';
        if (matchType === 'contains') return 'text-blue-600 bg-blue-100';
        if (matchType === 'fuzzy' && score <= 2) return 'text-cyan-600 bg-cyan-100';
        if (matchType === 'word-contains' || matchType === 'word-fuzzy') return 'text-purple-600 bg-purple-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getSimilarityLabel = (score, matchType) => {
        if (matchType === 'exact') return 'Exact';
        if (matchType === 'starts-with') return 'Prefix';
        if (matchType === 'contains') return 'Contains';
        if (matchType === 'fuzzy') return score <= 1 ? 'Near Match' : 'Similar';
        if (matchType === 'word-contains') return 'Word Match';
        if (matchType === 'word-fuzzy') return 'Word Similar';
        return 'Partial';
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                    Fuzzy Search Results ({results.length})
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Click on a result to navigate to it
                </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                    <div
                        key={`${result.translationKey}-${result.language}-${index}`}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => onResultClick && onResultClick(result)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {getResultLabel(result)}
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(result.similarityScore, result.matchType)}`}>
                                        {getSimilarityLabel(result.similarityScore, result.matchType)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {getResultSubtitle(result)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Project: {result.product || 'Unknown'}
                                </p>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                                <span className="text-xs font-mono text-gray-400">
                                    ~{result.similarityScore}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FuzzySearchResults;
