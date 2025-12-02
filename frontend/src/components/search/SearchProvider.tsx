'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { SearchableContent, SearchResult } from '@/lib/types';
import { searchContent } from './searchUtils';
import { useDebounce } from './useDebounce';

interface SearchContextType {
  content: SearchableContent;
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  selectedIndex: number;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  navigateToSelected: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: ReactNode;
  initialContent: SearchableContent;
}

export function SearchProvider({ children, initialContent }: SearchProviderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 150);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchContent(initialContent, debouncedQuery);
  }, [initialContent, debouncedQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const navigateToSelected = useCallback(() => {
    const selected = results[selectedIndex];
    if (selected) {
      router.push(selected.href);
      closeSearch();
    }
  }, [results, selectedIndex, router, closeSearch]);

  const value = useMemo(
    () => ({
      content: initialContent,
      isOpen,
      query,
      results,
      selectedIndex,
      openSearch,
      closeSearch,
      setQuery,
      setSelectedIndex,
      navigateToSelected,
    }),
    [
      initialContent,
      isOpen,
      query,
      results,
      selectedIndex,
      openSearch,
      closeSearch,
      navigateToSelected,
    ],
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context;
}
