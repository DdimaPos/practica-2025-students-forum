'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PostSearchResponse } from '@/lib/search/types';

interface SearchContextType {
  query: string;
  results: PostSearchResponse | undefined;
  loading: boolean;
  error: string | undefined;
  search: (newQuery: string) => void;
  searchNow: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSearchResponse | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
      const errorMessage = error_ instanceof Error ? error_.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const searchNow = useCallback(() => {
    performSearch(query);
  }, [query, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(undefined);
    setError(undefined);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        results,
        loading,
        error,
        search,
        searchNow,
        clearSearch,
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
