'use client';

import { Filter } from 'lucide-react';
import { useSearchContext } from '@/features/search/context/SearchContext';
import SearchDropdown from '@/features/search/components/SearchDropdown';
import { useRef, useEffect } from 'react';

export default function MobileSearchBar() {
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
      setShowDropdown(false);
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
    setShowDropdown(false);
    searchNow();
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  return (
    <div className='relative flex-1' ref={searchContainerRef}>
      <div className='flex rounded-md border border-gray-300 bg-white px-3 py-1.5'>
        <input
          type='text'
          placeholder='Search...'
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='min-w-0 flex-1 text-sm placeholder-gray-500 outline-none'
          disabled={loading}
        />
        <div className='flex items-center gap-2'>
          {query && (
            <button
              onClick={handleClearSearch}
              className='text-sm text-gray-400 hover:text-gray-600'
            >
              x
            </button>
          )}
          <Filter
            className={`h-4 w-4 cursor-pointer transition-colors ${
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
  );
}
