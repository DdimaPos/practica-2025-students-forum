'use client';

import {usePosts} from './hooks/usePosts';
import Posts from '../postList';

export default function PostsContainer() {
  const {posts, loading, loadMore} = usePosts();

  return <Posts posts={posts} loading={loading} loadMore={loadMore} />;
}
