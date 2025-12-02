'use client';

import { useRef, useEffect } from 'react';
import { useSearchContext } from './SearchProvider';

export default function SearchInput() {
  const { query, setQuery, closeSearch } = useSearchContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
      {/* Search icon */}
      <svg
        className="w-5 h-5 text-stone-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hledat..."
        className="flex-1 bg-transparent text-stone-800 placeholder:text-stone-400 outline-none text-base"
        aria-label="Vyhledávání"
      />

      {/* Clear query button */}
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Vymazat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Close modal button */}
      <button
        type="button"
        onClick={closeSearch}
        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
        aria-label="Zavřít"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
