'use client';

import React from 'react';
import { useSearchContext } from '@/features/search/context/SearchContext';
import { Calendar, User } from 'lucide-react';

export default function SearchDropdown() {
  const { suggestions, suggestionsLoading, showDropdown, query, searchNow, setShowDropdown } = useSearchContext();

  if (!showDropdown || !query.trim()) {
    return null;
  }

  const handleSuggestionClick = () => {
    setShowDropdown(false);
    searchNow();
  };

  const handleViewAllResults = () => {
    setShowDropdown(false);
    searchNow();
  };

  return (
    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto'>
      {suggestionsLoading ? (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
          <span className='ml-2 text-sm text-gray-600'>Searching...</span>
        </div>
      ) : suggestions && suggestions.results.length > 0 ? (
        <>
          <div className='px-3 py-2 text-xs text-gray-500 border-b border-gray-100'>
            Showing {suggestions.results.length} of {suggestions.total} results
          </div>
          
          {suggestions.results.map((post) => (
            <div
              key={post.id}
              onClick={handleSuggestionClick}
              className='px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
            >
              <div className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                  <User className='w-4 h-4 text-gray-500' />
                </div>
                
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900 truncate'>
                    {post.title}
                  </h4>
                  <p className='text-xs text-gray-600 mt-1 overflow-hidden' style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {post.content}
                  </p>
                  <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                    <span>by {post.author.firstName} {post.author.lastName}</span>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {suggestions.total > suggestions.results.length && (
            <div
              onClick={handleViewAllResults}
              className='px-3 py-3 text-center text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100'
            >
              View all {suggestions.total} results
            </div>
          )}
        </>
      ) : (
        <div className='px-3 py-4 text-sm text-gray-500 text-center'>
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
