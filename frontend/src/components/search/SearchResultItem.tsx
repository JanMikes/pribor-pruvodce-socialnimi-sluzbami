'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SearchResult, SearchResultType } from '@/lib/types';
import { CATEGORY_STYLES } from './searchUtils';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

// Icons for each result type
function ResultIcon({ type }: { type: SearchResultType }) {
  const iconClass = 'w-5 h-5';

  switch (type) {
    case 'provider':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'lifeSituation':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'crisisLine':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case 'healthcare':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'authority':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      );
    case 'emergency':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SearchResultItem({
  result,
  isSelected,
  onSelect,
  onClose,
}: SearchResultItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = CATEGORY_STYLES[result.type];

  const hasPreviewInfo = result.phone || result.address || result.availability;

  return (
    <div
      className={`group rounded-xl border transition-all ${
        isSelected ? `${styles.bgClass} ${styles.borderClass}` : 'border-transparent hover:bg-stone-50'
      }`}
      onMouseEnter={onSelect}
    >
      {/* Main row - clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${styles.iconBgClass} ${styles.textClass}`}>
          <ResultIcon type={result.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-800 truncate">{result.title}</span>
            {result.phone && (result.type === 'crisisLine' || result.type === 'emergency') && (
              <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${styles.bgClass} ${styles.textClass}`}>
                {result.phone}
              </span>
            )}
          </div>
          {result.subtitle && (
            <p className="text-sm text-stone-500 truncate">{result.subtitle}</p>
          )}
          {result.description && !isExpanded && (
            <p className="text-sm text-stone-400 truncate mt-0.5">{result.description}</p>
          )}
        </div>

        {/* Expand indicator */}
        {hasPreviewInfo && (
          <svg
            className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Expanded preview */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 ml-[52px] space-y-2">
          {/* Description */}
          {result.description && (
            <p className="text-sm text-stone-600">{result.description}</p>
          )}

          {/* Preview info */}
          <div className="flex flex-wrap gap-2 text-sm">
            {result.phone && (
              <a
                href={`tel:${result.phone.replace(/\s/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${styles.bgClass} ${styles.textClass} hover:opacity-80 transition-opacity`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {result.phone}
              </a>
            )}
            {result.availability && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success-50 text-success-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {result.availability}
              </span>
            )}
            {result.address && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[200px]">{result.address}</span>
              </span>
            )}
          </div>

          {/* Navigate button */}
          <Link
            href={result.href}
            onClick={onClose}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${styles.textClass} hover:${styles.bgClass} transition-colors`}
          >
            Přejít na stránku
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
