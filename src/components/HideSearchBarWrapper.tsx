'use client';

import { useEffect, ReactNode } from 'react';
import { useSearchBarVisibility } from '@/contexts/SearchBarVisibilityContext';

export default function HideSearchBarWrapper({ children }: { children: ReactNode }) {
  const { setIsVisible } = useSearchBarVisibility();

  useEffect(() => {
    setIsVisible(false);

    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  return <>{children}</>;
}
