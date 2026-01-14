'use client';

import * as Sentry from '@sentry/nextjs';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { PostSearchResponse } from '@/lib/search/types';

interface SearchContextType {
  query: string;
  results: PostSearchResponse | undefined;
  loading: boolean;
  error: string | undefined;
  suggestions: PostSearchResponse | undefined;
  suggestionsLoading: boolean;
  showDropdown: boolean;
  search: (query: string) => void;
  searchNow: () => void;
  clearSearch: () => void;
  setShowDropdown: (show: boolean) => void;
  performSuggestionSearch: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSearchResponse | undefined>();
  const [suggestions, setSuggestions] = useState<
    PostSearchResponse | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(undefined);
      setError(undefined);

      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const url = `/api/search/posts?q=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error_) {
      const errorMessage =
        error_ instanceof Error ? error_.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSuggestionSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions(undefined);
      setShowDropdown(false);

      return;
    }

    setSuggestionsLoading(true);

    try {
      const url = `/api/search/posts?q=${encodeURIComponent(searchQuery)}&limit=5`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Suggestion search failed: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(data.results.length > 0);
    } catch (error_) {
      Sentry.captureException(error_, {
        tags: { component: 'SearchContext', operation: 'suggestionSearch' },
        extra: { query: searchQuery },
      });
      setSuggestions(undefined);
      setShowDropdown(false);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const search = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        performSuggestionSearch(newQuery);
      }, 300);
    },
    [performSuggestionSearch]
  );

  const searchNow = useCallback(() => {
    setShowDropdown(false);
    performSearch(query);
  }, [query, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(undefined);
    setSuggestions(undefined);
    setError(undefined);
    setShowDropdown(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        results,
        suggestions,
        loading,
        suggestionsLoading,
        error,
        showDropdown,
        search,
        searchNow,
        clearSearch,
        setShowDropdown,
        performSuggestionSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }

  return context;
}
