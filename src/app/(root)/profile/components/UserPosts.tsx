'use client';

import Posts from '@/features/postList';
import { useState } from 'react';
import type { PostListItem } from '@/features/postList/types/post';

type UserPostsProps = {
  initialPosts: PostListItem[];
};

export default function UserPosts({ initialPosts }: UserPostsProps) {
  const [posts] = useState<PostListItem[]>(initialPosts);

  return (
    <Posts posts={posts} loading={false} hasMore={false} loadingMore={false} />
  );
}
