'use client';

import Posts from '@/features/postList';
import { useState } from 'react';

type Post = {
  id: string;
  author: string;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
};

type UserPostsProps = {
  initialPosts: Post[];
};

export default function UserPosts({ initialPosts }: UserPostsProps) {
  const [posts] = useState<Post[]>(initialPosts);

  return (
    <Posts posts={posts} loading={false} hasMore={false} loadingMore={false} />
  );
}
