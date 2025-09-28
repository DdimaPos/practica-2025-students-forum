'use client';

import {usePosts} from './hooks/usePosts';
import Posts from '../postList';
import { useEffect, useRef } from 'react';

export default function PostsContainer() {
  const {posts, loading, loadMore, hasMore, loadingMore, isSearchMode, searchResultsCount} = usePosts();
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
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
          <p className='text-blue-700 text-sm'>
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
