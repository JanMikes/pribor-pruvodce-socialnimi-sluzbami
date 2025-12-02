'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchContext } from './SearchProvider';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

export default function SearchModal() {
  const {
    isOpen,
    closeSearch,
    results,
    selectedIndex,
    setSelectedIndex,
    navigateToSelected,
  } = useSearchContext();

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results.length > 0) {
            navigateToSelected();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch, results, selectedIndex, setSelectedIndex, navigateToSelected]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click on container (outside modal)
  const handleContainerClick = (e: React.MouseEvent) => {
    // Close only if clicking directly on the container, not on modal content
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  // Use portal to render modal at document body level
  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Vyhledávání">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal container - clicking here (outside modal) closes search */}
      <div
        className="absolute inset-0 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4"
        onClick={handleContainerClick}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-soft-lg overflow-hidden animate-slide-up
                     max-h-[80vh] sm:max-h-[70vh] flex flex-col"
        >
          {/* Search input */}
          <SearchInput />

          {/* Results */}
          <SearchResults />
        </div>
      </div>
    </div>,
    document.body,
  );
}
