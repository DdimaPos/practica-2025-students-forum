'use client';

import {Filter} from 'lucide-react';
import {Button} from '@/components/ui/button';
import { useSearchContext } from '@/features/search/context/SearchContext';

export default function SearchBar() {
  const {
    query,
    loading,
    search,
    searchNow,
    clearSearch,
  } = useSearchContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchNow();
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

  return (
    <div className='flex w-full justify-between'>
      <div className='flex w-4/6 rounded-md border border-gray-300 bg-white px-3 py-2'>
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
              className='text-gray-400 hover:text-gray-600 text-sm'
            >
              ✕
            </button>
          )}
          <Filter 
            className={`h-5 w-5 cursor-pointer transition-colors ${
              loading 
                ? 'text-blue-500 animate-pulse' 
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={handleFilterClick}
          />
        </div>
      </div>

      <Button>Write a new post</Button>
    </div>
  );
}
