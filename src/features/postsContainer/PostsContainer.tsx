'use client';

import { usePosts } from './hooks/usePosts';
import Posts from '../postList';
import { useEffect, useRef } from 'react';

export default function PostsContainer() {
  const { posts, loading, loadMore, hasMore, loadingMore, isSearchMode, searchResultsCount } = usePosts();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isNearBottom && hasMore && !loadingMore) {
        loadMore();
      }
    };

    const scrollContainer = containerRef.current?.closest('[class*="overflow-y-auto"]') as HTMLElement;

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);

      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div ref={containerRef}>
      {isSearchMode && (
        <div className='border border-blue-200 bg-blue-50 p-3'>
          <p className='text-sm text-blue-700'>
            🔍 Search Results: {searchResultsCount} post(s) found
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
