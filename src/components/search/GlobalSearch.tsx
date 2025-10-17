'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { KeyboardNavigation, useKeyboardShortcuts } from '@/components/accessibility/KeyboardNavigation';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'module' | 'feature' | 'setting' | 'help';
  href: string;
  category: string;
  keywords: string[];
  lastAccessed?: Date;
  relevanceScore: number;
}

interface SearchCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { announceToScreenReader } = useAccessibility();
  
  const searchOperation = useAsyncOperation();

  // Mock search data - in production, this would come from your API
  const mockSearchData: SearchResult[] = [
    {
      id: '1',
      title: 'Dashboard',
      description: 'Main control center with analytics and overview',
      type: 'page',
      href: '/dashboard',
      category: 'Core',
      keywords: ['dashboard', 'overview', 'analytics', 'home'],
      relevanceScore: 10
    },
    {
      id: '2',
      title: 'Plant Monitoring',
      description: 'Advanced sensor integration and plant communication',
      type: 'module',
      href: '/plant-monitoring',
      category: 'Cultivation',
      keywords: ['plant', 'monitoring', 'sensors', 'communication'],
      relevanceScore: 9
    },
    {
      id: '3',
      title: 'Cultivation Control',
      description: 'Grow management system with environmental controls',
      type: 'module',
      href: '/cultivation',
      category: 'Cultivation',
      keywords: ['cultivation', 'grow', 'environment', 'control'],
      relevanceScore: 9
    },
    {
      id: '4',
      title: 'Analytics Dashboard',
      description: 'Advanced data analysis and insights',
      type: 'module',
      href: '/analytics',
      category: 'Analytics',
      keywords: ['analytics', 'data', 'insights', 'reports'],
      relevanceScore: 8
    },
    {
      id: '5',
      title: 'Energy Management',
      description: 'Optimization tools and monitoring',
      type: 'feature',
      href: '/energy',
      category: 'Tools',
      keywords: ['energy', 'optimization', 'efficiency', 'power'],
      relevanceScore: 7
    },
    {
      id: '6',
      title: 'Customer Success',
      description: 'Track progress and access training resources',
      type: 'page',
      href: '/customer-success',
      category: 'Support',
      keywords: ['customer', 'success', 'training', 'help'],
      relevanceScore: 6
    },
    {
      id: '7',
      title: 'Settings',
      description: 'Account settings and preferences',
      type: 'setting',
      href: '/settings',
      category: 'Account',
      keywords: ['settings', 'preferences', 'account', 'config'],
      relevanceScore: 5
    },
    {
      id: '8',
      title: 'FAQ',
      description: 'Frequently asked questions and help documentation',
      type: 'help',
      href: '/faq',
      category: 'Support',
      keywords: ['faq', 'help', 'questions', 'support', 'documentation'],
      relevanceScore: 8
    }
  ];

  const searchCategories: SearchCategory[] = [
    { id: 'all', name: 'All Results', count: 0, color: 'text-gray-400' },
    { id: 'page', name: 'Pages', count: 0, color: 'text-blue-400' },
    { id: 'module', name: 'Modules', count: 0, color: 'text-purple-400' },
    { id: 'feature', name: 'Features', count: 0, color: 'text-green-400' },
    { id: 'setting', name: 'Settings', count: 0, color: 'text-orange-400' },
    { id: 'help', name: 'Help', count: 0, color: 'text-cyan-400' }
  ];

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    return searchOperation.execute(
      async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const lowercaseQuery = searchQuery.toLowerCase();
        const searchResults = mockSearchData
          .filter(item => 
            item.title.toLowerCase().includes(lowercaseQuery) ||
            item.description.toLowerCase().includes(lowercaseQuery) ||
            item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
          )
          .filter(item => 
            activeFilters.length === 0 || 
            activeFilters.includes('all') || 
            activeFilters.includes(item.type)
          )
          .sort((a, b) => {
            // Calculate relevance score based on match quality
            const aScore = calculateRelevanceScore(a, lowercaseQuery);
            const bScore = calculateRelevanceScore(b, lowercaseQuery);
            return bScore - aScore;
          })
          .slice(0, 10);

        return searchResults;
      },
      {
        onSuccess: (searchResults) => {
          setResults(searchResults);
          setSelectedIndex(-1);
          announceToScreenReader(`Found ${searchResults.length} results for "${searchQuery}"`);
        },
        onError: () => {
          setResults([]);
          announceToScreenReader('Search failed. Please try again.');
        }
      }
    );
  }, [activeFilters, searchOperation, announceToScreenReader]);

  // Calculate relevance score
  const calculateRelevanceScore = (item: SearchResult, query: string): number => {
    let score = item.relevanceScore;
    
    // Boost score for exact title matches
    if (item.title.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // Boost score for keyword matches
    const keywordMatches = item.keywords.filter(keyword => 
      keyword.toLowerCase().includes(query)
    ).length;
    score += keywordMatches * 5;
    
    // Boost score for recent access
    if (item.lastAccessed) {
      const daysSinceAccess = (Date.now() - item.lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) {
        score += 3;
      }
    }
    
    return score;
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': onClose,
    'ctrl+k': () => searchInputRef.current?.focus(),
    'meta+k': () => searchInputRef.current?.focus(),
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));
    
    // Navigate and close
    router.push(result.href);
    onClose();
    
    announceToScreenReader(`Navigating to ${result.title}`);
  };

  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setActiveFilters([]);
    } else {
      setActiveFilters(prev => 
        prev.includes(filterId)
          ? prev.filter(f => f !== filterId)
          : [...prev.filter(f => f !== 'all'), filterId]
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <KeyboardNavigation trapFocus restoreFocus>
          <div 
            className="relative bg-gray-900 rounded-2xl w-full max-w-2xl mt-12 border border-gray-800 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search modules, pages, and features..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  aria-label="Search input"
                  aria-describedby="search-instructions"
                />
                {searchOperation.loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 animate-spin" aria-hidden="true" />
                )}
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle search filters"
                aria-expanded={showFilters}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="search-instructions" className="sr-only">
              Use arrow keys to navigate results, Enter to select, Escape to close
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex flex-wrap gap-2">
                  {searchCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleFilter(category.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        activeFilters.includes(category.id) || (activeFilters.length === 0 && category.id === 'all')
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                      aria-pressed={activeFilters.includes(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query && results.length > 0 && (
                <div 
                  ref={resultsRef}
                  className="p-2"
                  role="listbox"
                  aria-label="Search results"
                >
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        index === selectedIndex
                          ? 'bg-purple-600/20 border border-purple-600/30'
                          : 'hover:bg-gray-800'
                      }`}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{result.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              result.type === 'page' ? 'bg-blue-600/20 text-blue-400' :
                              result.type === 'module' ? 'bg-purple-600/20 text-purple-400' :
                              result.type === 'feature' ? 'bg-green-600/20 text-green-400' :
                              result.type === 'setting' ? 'bg-orange-600/20 text-orange-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{result.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{result.category}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && !searchOperation.loading && (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
                </div>
              )}

              {!query && recentSearches.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="w-full text-left p-2 hover:bg-gray-800 rounded-lg text-gray-300 text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">esc</kbd>
                    Close
                  </span>
                </div>
                <span>
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd> anytime to search
                </span>
              </div>
            </div>
          </div>
        </KeyboardNavigation>
      </div>
    </div>
  );
}