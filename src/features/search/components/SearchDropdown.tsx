'use client';

import React from 'react';
import { useSearchContext } from '@/features/search/context/SearchContext';
import { UserAvatar, UserName } from '@/components/generic/user';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchDropdown() {
  const {
    suggestions,
    suggestionsLoading,
    showDropdown,
    query,
    searchNow,
    setShowDropdown,
  } = useSearchContext();
  const router = useRouter();

  if (!showDropdown || !query.trim()) {
    return null;
  }

  const handleSuggestionClick = (id: string) => {
    setShowDropdown(false);
    router.push(`/posts/${id}`);
  };
  const handleViewAllResults = () => {
    setShowDropdown(false);
    searchNow();
  };

  return (
    <div className='absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg'>
      {suggestionsLoading ? (
        <div className='flex items-center justify-center py-4'>
          <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500'></div>
          <span className='ml-2 text-sm text-gray-600'>Searching...</span>
        </div>
      ) : suggestions && suggestions.results.length > 0 ? (
        <>
          <div className='border-b border-gray-100 px-3 py-2 text-xs text-gray-500'>
            Showing {suggestions.results.length} of {suggestions.total} results
          </div>

          {suggestions.results.map(post => (
            <div
              key={post.id}
              onClick={() => handleSuggestionClick(post.id)}
              className='cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-50'
            >
              <div className='flex items-start gap-3'>
                <UserAvatar
                  profilePictureUrl={post.author.profilePictureUrl}
                  firstName={post.author.firstName}
                  lastName={post.author.lastName}
                  className='h-8 w-8 flex-shrink-0'
                />

                <div className='min-w-0 flex-1'>
                  <h4 className='truncate text-sm font-medium text-gray-900'>
                    {post.title}
                  </h4>
                  <p
                    className='mt-1 overflow-hidden text-xs text-gray-600'
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.content}
                  </p>
                  <div className='mt-2 flex items-center gap-4 text-xs text-gray-500'>
                    <UserName
                      firstName={post.author.firstName}
                      lastName={post.author.lastName}
                      userType={post.author.userType}
                      userId={post.author.id}
                      showLink={false}
                      prefix='by'
                    />
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {suggestions.total > suggestions.results.length && (
            <div
              onClick={handleViewAllResults}
              className='cursor-pointer border-t border-gray-100 px-3 py-3 text-center text-sm text-blue-600 hover:bg-blue-50'
            >
              View all {suggestions.total} results
            </div>
          )}
        </>
      ) : (
        <div className='px-3 py-4 text-center text-sm text-gray-500'>
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
