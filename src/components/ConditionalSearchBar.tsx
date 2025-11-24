'use client';

import SearchBar from '@/features/SearchBar';
import { useSearchBarVisibility } from '@/contexts/SearchBarVisibilityContext';

export default function ConditionalSearchBar() {
  const { isVisible } = useSearchBarVisibility();

  if (!isVisible) {
    return null;
  }

  return <SearchBar />;
}
