'use client';

import {usePosts} from './hooks/usePosts';
import Posts from '../postList';

export default function PostsContainer() {
  const {posts, loading, loadMore, isSearchMode, searchResultsCount} = usePosts();

  return (
    <div>
      {isSearchMode && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
          <p className='text-blue-700 text-sm'>
            🔍 Search Results: {searchResultsCount} post(s) found
          </p>
        </div>
      )}
      <Posts posts={posts} loading={loading} loadMore={loadMore} />
    </div>
  );
}
