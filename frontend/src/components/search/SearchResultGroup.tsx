'use client';

import type { SearchResult, SearchResultType } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_STYLES } from './searchUtils';
import SearchResultItem from './SearchResultItem';

interface SearchResultGroupProps {
  type: SearchResultType;
  results: SearchResult[];
  selectedIndex: number;
  startIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function SearchResultGroup({
  type,
  results,
  selectedIndex,
  startIndex,
  onSelect,
  onClose,
}: SearchResultGroupProps) {
  if (results.length === 0) return null;

  const styles = CATEGORY_STYLES[type];
  const label = CATEGORY_LABELS[type];

  return (
    <div className="py-2">
      {/* Group header */}
      <div className={`flex items-center gap-2 px-3 py-1.5 mb-1`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${styles.textClass}`}>
          {label}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${styles.bgClass} ${styles.textClass}`}>
          {results.length}
        </span>
      </div>

      {/* Results */}
      <div className="space-y-1">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            isSelected={selectedIndex === startIndex + index}
            onSelect={() => onSelect(startIndex + index)}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}
