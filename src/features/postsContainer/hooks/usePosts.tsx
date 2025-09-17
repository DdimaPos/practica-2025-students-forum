'use client';

import {useEffect, useState} from 'react';
import axios from 'axios';

export type Post = {
  id: number;
  author: string;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
};

const PAGE_SIZE = 5;

export function usePosts() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Post[]>('/mocks/posts.json')
      .then(res => {
        setAllPosts(res.data);
        setPosts(res.data.slice(0, PAGE_SIZE));
      })
      .catch(error => console.error('Error during loading:', error))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = () => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const nextPosts = allPosts.slice(start, end);

    if (nextPosts.length > 0) {
      setPosts(prev => [...prev, ...nextPosts]);
      setPage(prev => prev + 1);
    }
  };

  return {posts, loading, loadMore};
}
