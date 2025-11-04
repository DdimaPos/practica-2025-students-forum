'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchContext } from '@/features/search/context/SearchContext';
import SearchDropdown from '@/features/search/components/SearchDropdown';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const {
    query,
    loading,
    showDropdown,
    search,
    searchNow,
    clearSearch,
    setShowDropdown,
  } = useSearchContext();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, setShowDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchNow();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);

    if (!e.target.value.trim()) {
      clearSearch();
    }
  };

  const handleFilterClick = () => {
    searchNow();
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handlePostCreationClick = () => {
    router.push('/posts/create-post');
  };

  return (
    <div className='flex w-full justify-between'>
      <div className='relative w-4/6' ref={searchContainerRef}>
        <div className='flex rounded-md border border-gray-300 bg-white px-3 py-2'>
          <input
            type='text'
            placeholder='Search...'
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className='flex-1 text-sm placeholder-gray-500 outline-none'
            disabled={loading}
          />
          <div className='flex items-center gap-2'>
            {query && (
              <button
                onClick={handleClearSearch}
                className='text-sm text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            )}
            <Filter
              className={`h-5 w-5 cursor-pointer transition-colors ${
                loading
                  ? 'animate-pulse text-blue-500'
                  : 'text-gray-500 hover:text-black'
              }`}
              onClick={handleFilterClick}
            />
          </div>
        </div>
        <SearchDropdown />
      </div>

      <Button
        onClick={handlePostCreationClick}
        className='cursor-pointer transition-colors'
      >
        Write a new post
      </Button>
    </div>
  );
}
