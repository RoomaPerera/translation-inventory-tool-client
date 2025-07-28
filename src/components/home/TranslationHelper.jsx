import React from 'react';

/**
 * A panel that displays translation suggestions and glossary terms.
 * @param {Array} suggestions - List of translation suggestion objects.
 * @param {Array} glossary - List of glossary term objects.
 * @param {Function} onSuggestionClick - Function to call when a suggestion is clicked.
 * @param {boolean} isLoading - Whether the panel is currently fetching data.
 */
const TranslationHelper = ({ suggestions, glossary, onSuggestionClick, isLoading }) => {
  return (
    <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Translation Helper</h3>

      {/* Loading State */}
      {isLoading && <p className="text-sm text-gray-500">Fetching assistance...</p>}

      {!isLoading && (
        <>
          {/* Suggestions Section */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Suggestions</h4>
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
                      From "{s.sourceText}" (Similarity: {s.similarity * 100}%)
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No similar translations found.</p>
            )}
          </div>

          {/* Glossary Section */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Glossary Terms</h4>
            {glossary.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {glossary.map((g, i) => (
                  <span key={i} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {g.term}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No glossary terms extracted.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TranslationHelper;