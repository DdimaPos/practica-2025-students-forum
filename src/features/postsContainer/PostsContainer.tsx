'use client';

import { usePosts } from './hooks/usePosts';
import Posts from '../postList';
import { useEffect, useRef } from 'react';

const SCROLL_THRESHOLD = 500; // pixels from bottom to trigger load

export default function PostsContainer() {
  const {
    posts,
    loading,
    loadMore,
    hasMore,
    loadingMore,
    isSearchMode,
    searchResultsCount,
  } = usePosts();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - scrollPosition;

      if (distanceFromBottom <= SCROLL_THRESHOLD) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div ref={containerRef}>
      {isSearchMode && (
        <div className='border border-blue-200 bg-blue-50 p-3'>
          <p className='text-sm text-blue-700'>
            Search Results: {searchResultsCount} post(s) found
          </p>
        </div>
      )}
      <Posts
        posts={posts}
        loading={loading}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  );
}
