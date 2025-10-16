'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchContext } from '@/features/search/context/SearchContext';

export type Post = {
  id: string;
  author: string;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
};

const POSTS_PER_PAGE = 10;

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const offsetRef = useRef(0);
  const searchQueryRef = useRef('');

  const { results: searchResults, query: searchQuery, loading: searchLoading } = useSearchContext();

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  const fetchPosts = useCallback(async (currentOffset: number, append = false) => {
    const setState = append ? setLoadingMore : setLoading;
    setState(true);
    loadingMoreRef.current = append;

    try {
      const response = await fetch(`/api/posts?limit=${POSTS_PER_PAGE}&offset=${currentOffset}`);

      if (!response.ok) throw new Error('Failed to fetch posts');

      const { posts: newPosts, hasMore: moreAvailable } = await response.json();
      
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
      
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setState(false);
      loadingMoreRef.current = false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || loadingMoreRef.current || searchQueryRef.current) return;
    
    offsetRef.current += POSTS_PER_PAGE;
    fetchPosts(offsetRef.current, true);
  }, [fetchPosts]);

  useEffect(() => {
    offsetRef.current = 0;
    hasMoreRef.current = true;
    fetchPosts(0);
  }, [fetchPosts]);

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

  return {
    posts: displayPosts, 
    loading: searchQuery ? searchLoading : loading, 
    loadMore,
    hasMore: searchQuery ? false : hasMore,
    loadingMore,
    isSearchMode: !!(searchQuery && searchResults), 
    searchResultsCount: searchResults?.results.length || 0,
  };
}
