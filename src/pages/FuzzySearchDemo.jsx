import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import FuzzySearchInput from '../components/reusableComponents/FuzzySearchInput';
import FuzzySearchResults from '../components/reusableComponents/FuzzySearchResults';
import fuzzySearchService from '../services/fuzzySearchService';

const FuzzySearchDemo = () => {
    const { user } = useAuthContext();
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSearchType, setSelectedSearchType] = useState('key');
    const [lastSearch, setLastSearch] = useState('');

    const handleManualSearch = async () => {
        if (!lastSearch.trim() || lastSearch.length < 2) {
            return;
        }

        setIsLoading(true);
        try {
            const results = await fuzzySearchService.searchTranslations(lastSearch, selectedSearchType);
            setSearchResults(results || []);
        } catch (error) {
            console.error('Manual fuzzy search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (result) => {
        console.log('Selected result:', result);
        // In a real application, you might navigate to the specific translation
        // or open it in an edit modal
        alert(`Selected: ${result.translationKey} (${result.language})`);
    };

    const searchTypes = [
        { value: 'key', label: 'Translation Keys', description: 'Search through translation keys' },
        { value: 'text', label: 'Translated Text', description: 'Search through translated content' },
        { value: 'project', label: 'Projects', description: 'Search through project names' },
        { value: 'language', label: 'Languages', description: 'Search through language codes' }
    ];

    // Examples for each search type
    const examples = {
        key: ['welcome', 'login', 'button', 'error', 'success'],
        text: ['Welcome', 'Hello', 'Save', 'Cancel', 'Loading'],
        project: ['web-app', 'mobile', 'dashboard', 'api'],
        language: ['en', 'fr', 'es', 'de', 'zh']
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Fuzzy Search Demo
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Experience intelligent search across your translation data. Our fuzzy search helps you find 
                        what you're looking for even with typos, partial matches, or approximate spelling.
                    </p>
                </div>

                {/* Search Type Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Search Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {searchTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedSearchType(type.value)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                    selectedSearchType === type.value
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <h3 className={`font-medium mb-1 ${
                                    selectedSearchType === type.value ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    {type.label}
                                </h3>
                                <p className={`text-sm ${
                                    selectedSearchType === type.value ? 'text-blue-700' : 'text-gray-600'
                                }`}>
                                    {type.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Examples */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Try searching for: {searchTypes.find(t => t.value === selectedSearchType)?.label}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {examples[selectedSearchType]?.map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setLastSearch(example)}
                                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Fuzzy Search */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Real-time Fuzzy Search Input */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Fuzzy Search</h2>
                        <p className="text-gray-600 mb-4">
                            Search as you type with instant fuzzy matching results
                        </p>
                        <FuzzySearchInput
                            placeholder={`Search ${searchTypes.find(t => t.value === selectedSearchType)?.label.toLowerCase()}...`}
                            searchType={selectedSearchType}
                            onResultSelect={handleResultClick}
                            onQueryChange={setLastSearch}
                            className="w-full"
                        />
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Type 2+ characters to start searching</li>
                                <li>• Results update in real-time with fuzzy matching</li>
                                <li>• Click any result to select it</li>
                                <li>• Use arrow keys to navigate results</li>
                            </ul>
                        </div>
                    </div>

                    {/* Manual Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Search</h2>
                        <p className="text-gray-600 mb-4">
                            Enter a search term and click search to see all results
                        </p>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={lastSearch}
                                onChange={(e) => setLastSearch(e.target.value)}
                                placeholder={`Enter ${searchTypes.find(t => t.value === selectedSearchType)?.label.toLowerCase()} to search...`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                            />
                            <button
                                onClick={handleManualSearch}
                                disabled={!lastSearch.trim() || lastSearch.length < 2 || isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        <FuzzySearchResults
                            results={searchResults}
                            onResultClick={handleResultClick}
                            isLoading={isLoading}
                            searchType={selectedSearchType}
                        />
                    </div>
                </div>

                {/* Features Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Fuzzy Search Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Typo Tolerance</h3>
                            <p className="text-sm text-gray-600">
                                Find results even with spelling mistakes or typos
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Fast Performance</h3>
                            <p className="text-sm text-gray-600">
                                Quick search results with intelligent caching
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Smart Scoring</h3>
                            <p className="text-sm text-gray-600">
                                Results ranked by relevance and similarity
                            </p>
                        </div>
                    </div>
                </div>

                {/* Integration Info */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Where to Find Fuzzy Search</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h3 className="font-medium text-gray-900 mb-2">Home Page</h3>
                            <p className="text-sm text-gray-600">
                                The main search bar now uses fuzzy search for translation keys
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h3 className="font-medium text-gray-900 mb-2">All Entries Page</h3>
                            <p className="text-sm text-gray-600">
                                Enhanced toolbar with separate fuzzy search for keys and text
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuzzySearchDemo;
