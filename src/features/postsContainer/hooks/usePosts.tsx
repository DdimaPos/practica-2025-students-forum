'use client';

import {useEffect, useState} from 'react';
import { useSearchContext } from '@/features/search/context/SearchContext';

export type Post = {
  id: number;
  author: string;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
};

const loadMore = () => {
};

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { results: searchResults, query: searchQuery, loading: searchLoading } = useSearchContext();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const displayPosts = searchQuery && searchResults ? 
    searchResults.results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      author: `${result.author.firstName} ${result.author.lastName}`,
      created_at: result.createdAt,
      rating: 0,
      photo: '',
    })) : posts;

  const isLoading = searchQuery ? searchLoading : loading;

  return {
    posts: displayPosts, 
    loading: isLoading, 
    loadMore,
    isSearchMode: !!(searchQuery && searchResults), 
    searchResultsCount: searchResults?.results.length || 0,
  };
}
