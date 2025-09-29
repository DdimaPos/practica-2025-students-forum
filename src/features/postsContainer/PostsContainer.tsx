'use client';

import { usePosts } from './hooks/usePosts';
import Posts from '../postList';

export default function PostsContainer() {
  const { posts, loading, loadMore, isSearchMode, searchResultsCount } =
    usePosts();

  return (
    <div>
      {isSearchMode && (
        <div className='mb-4 rounded-md border border-blue-200 bg-blue-50 p-3'>
          <p className='text-sm text-blue-700'>
            🔍 Search Results: {searchResultsCount} post(s) found
          </p>
        </div>
      )}
      <Posts posts={posts} loading={loading} loadMore={loadMore} />
    </div>
  );
}
