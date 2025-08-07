// Updated FuzzySearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import fuzzySearchService from '../../services/fuzzySearchService';
import useDebounce from '../../hooks/useDebounce';

const FuzzySearchInput = ({ 
    placeholder = "Search...", 
    searchType = "key", 
    onResultSelect, 
    onQueryChange, 
    className = "",
    disabled = false,
    showResults = true 
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    // Reduced debounce time for better responsiveness with improved backend
    const debouncedQuery = useDebounce(query, 200);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    // Search function
    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            setIsLoading(true);
            try {
                const searchResults = await fuzzySearchService.searchTranslations(debouncedQuery, searchType);
                
                // Process results to show only relevant unique values
                const processedResults = processResultsByType(searchResults || [], searchType);
                setResults(processedResults);
                setShowDropdown(showResults && processedResults.length > 0);
            } catch (error) {
                console.error('Fuzzy search error:', error);
                setResults([]);
                setShowDropdown(false);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, searchType, showResults]);

    // Updated to handle new backend response format
    const processResultsByType = (results, type) => {
        const uniqueValues = new Map();
        
        results.forEach(result => {
            let key, value;
            
            switch (type) {
                case 'project':
                    key = result.product;
                    value = {
                        displayValue: result.product,
                        similarityScore: result.similarityScore,
                        type: 'project'
                    };
                    break;
                case 'language':
                    key = result.language;
                    value = {
                        displayValue: result.language,
                        similarityScore: result.similarityScore,
                        type: 'language'
                    };
                    break;
                case 'key':
                    key = `${result.translationKey}-${result.language}`;
                    value = {
                        displayValue: result.translationKey,
                        language: result.language,
                        translatedText: result.translatedText,
                        similarityScore: result.similarityScore,
                        type: 'key'
                    };
                    break;
                case 'text':
                    key = `${result.translatedText}-${result.language}`;
                    value = {
                        displayValue: result.translatedText,
                        translationKey: result.translationKey,
                        language: result.language,
                        similarityScore: result.similarityScore,
                        type: 'text'
                    };
                    break;
                default:
                    key = result.matchedField;
                    value = {
                        displayValue: result.matchedField,
                        similarityScore: result.similarityScore,
                        type: 'default'
                    };
            }
            
            // Keep the result with the best (lowest) similarity score
            if (key && (!uniqueValues.has(key) || uniqueValues.get(key).similarityScore > value.similarityScore)) {
                uniqueValues.set(key, value);
            }
        });
        
        // Convert back to array and sort by similarity score
        return Array.from(uniqueValues.values()).sort((a, b) => a.similarityScore - b.similarityScore);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);
        
        if (onQueryChange) {
            onQueryChange(value);
        }
    };

    // Handle result selection
    const handleResultSelect = (result) => {
        const selectedValue = result.displayValue || result.matchedField || '';
        setQuery(selectedValue);
        setShowDropdown(false);
        setSelectedIndex(-1);
        
        if (onResultSelect) {
            // Create a result object that's compatible with the expected format
            const resultToPass = {
                ...result,
                matchedField: selectedValue,
                // For backward compatibility
                translationKey: result.translationKey || selectedValue,
                language: result.language,
                translatedText: result.translatedText,
                product: result.type === 'project' ? selectedValue : undefined,
                matchType: result.matchType // Include new match type info
            };
            onResultSelect(resultToPass);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleResultSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Updated to handle new match types
    const getResultDisplay = (result) => {
        const getMatchTypeLabel = (matchType, score) => {
            switch (matchType) {
                case 'exact': return 'Exact';
                case 'starts-with': return 'Prefix';
                case 'contains': return 'Contains';
                case 'fuzzy': return score <= 1 ? 'Near' : 'Similar';
                case 'word-contains': return 'Word';
                case 'word-fuzzy': return 'Word~';
                default: return `~${score}`;
            }
        };

        switch (result.type || searchType) {
            case 'key':
                return {
                    primary: result.displayValue,
                    secondary: result.language ? `${result.language?.toUpperCase()} • ${result.translatedText || 'No translation'}` : '',
                    score: result.similarityScore,
                    matchType: result.matchType,
                    label: getMatchTypeLabel(result.matchType, result.similarityScore)
                };
            case 'text':
                return {
                    primary: result.displayValue,
                    secondary: result.translationKey ? `${result.translationKey} • ${result.language?.toUpperCase()}` : '',
                    score: result.similarityScore,
                    matchType: result.matchType,
                    label: getMatchTypeLabel(result.matchType, result.similarityScore)
                };
            case 'project':
                return {
                    primary: result.displayValue,
                    secondary: 'Project',
                    score: result.similarityScore,
                    matchType: result.matchType,
                    label: getMatchTypeLabel(result.matchType, result.similarityScore)
                };
            case 'language':
                return {
                    primary: result.displayValue,
                    secondary: 'Language',
                    score: result.similarityScore,
                    matchType: result.matchType,
                    label: getMatchTypeLabel(result.matchType, result.similarityScore)
                };
            default:
                return {
                    primary: result.displayValue || result.matchedField,
                    secondary: '',
                    score: result.similarityScore,
                    matchType: result.matchType,
                    label: getMatchTypeLabel(result.matchType, result.similarityScore)
                };
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="search"
                    className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    disabled={disabled}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}
            </div>

            {/* Results dropdown */}
            {showDropdown && results.length > 0 && (
                <div 
                    ref={resultsRef}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                    {results.map((result, index) => {
                        const display = getResultDisplay(result);
                        const isSelected = index === selectedIndex;
                        
                        return (
                            <div
                                key={`${result.translationKey}-${result.language}-${index}`}
                                className={`relative cursor-pointer select-none py-2 px-3 ${
                                    isSelected 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                                onClick={() => handleResultSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                            {display.primary}
                                        </div>
                                        <div className={`text-sm truncate ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                                            {display.secondary}
                                        </div>
                                    </div>
                                    <div className={`text-xs font-mono ml-2 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {display.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FuzzySearchInput;
