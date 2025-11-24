'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SearchBarContextType = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

const SearchBarContext = createContext<SearchBarContextType | undefined>(
  undefined
);

export function SearchBarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <SearchBarContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </SearchBarContext.Provider>
  );
}

export function useSearchBarVisibility() {
  const context = useContext(SearchBarContext);

  if (context === undefined) {
    throw new Error(
      'useSearchBarVisibility must be used within a SearchBarProvider'
    );
  }

  return context;
}
