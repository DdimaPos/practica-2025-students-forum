'use client';

import {useEffect, useRef} from 'react';

export function useInfiniteScroll(callback: () => void) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const node = loaderRef.current;

    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting) {
          callback();
        }
      },
      {threshold: 1}
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [callback]);

  return loaderRef;
}
