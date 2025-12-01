'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/features/SearchBar';

export default function DesktopTopBar() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 100;
      const newOpacity = Math.min(scrollY / maxScroll, 0.7);
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className='sticky top-0 z-50 flex transition-all duration-150'
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: opacity > 0 ? `blur(${opacity * 8}px)` : 'none',
      }}
    >
      <div className='flex w-[25%] items-center px-6 py-4'>
        <span className='text-xl font-bold text-gray-800'>Peerplex</span>
      </div>
      <div className='flex-1 px-10 py-4'>
        <SearchBar />
      </div>
      {/* Bottom fade gradient */}
      <div
        className='pointer-events-none absolute right-0 bottom-0 left-0 h-4 translate-y-full'
        style={{
          background: `linear-gradient(to bottom, rgba(255, 255, 255, ${opacity}), transparent)`,
        }}
      />
    </div>
  );
}
