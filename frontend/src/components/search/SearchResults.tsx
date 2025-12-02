'use client';

import Link from 'next/link';
import { useSearchContext } from './SearchProvider';
import { groupResultsByType, TYPE_DISPLAY_ORDER } from './searchUtils';
import SearchResultGroup from './SearchResultGroup';

// Quick links for empty state
const quickLinks = [
  {
    name: 'Krizové linky',
    href: '/krizove-linky',
    description: 'Nápomoc v těžkých chvílích',
    color: 'secondary',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    name: 'Životní situace',
    href: '/zivotni-situace',
    description: 'Potřebuji pomoc s...',
    color: 'primary',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: 'Zdravotnictví',
    href: '/zdravotnictvi',
    description: 'Lékaři a lékárny',
    color: 'healthcare',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: 'Úřady',
    href: '/urady',
    description: 'Státní správa',
    color: 'authority',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    name: 'Poskytovatelé',
    href: '/poskytovatele',
    description: 'Sociální služby',
    color: 'primary',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    hover: 'hover:bg-primary-100',
  },
  secondary: {
    bg: 'bg-secondary-50',
    text: 'text-secondary-600',
    hover: 'hover:bg-secondary-100',
  },
  healthcare: {
    bg: 'bg-healthcare-50',
    text: 'text-healthcare-600',
    hover: 'hover:bg-healthcare-100',
  },
  authority: {
    bg: 'bg-authority-50',
    text: 'text-authority-600',
    hover: 'hover:bg-authority-100',
  },
};

export default function SearchResults() {
  const { query, results, selectedIndex, setSelectedIndex, closeSearch } = useSearchContext();

  // Empty state - show quick links
  if (!query.trim()) {
    return (
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
          Rychlé odkazy
        </p>
        <div className="space-y-1">
          {quickLinks.map((link) => {
            const colors = colorClasses[link.color];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSearch}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${colors.hover}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
                  {link.icon}
                </div>
                <div>
                  <span className="font-medium text-stone-800">{link.name}</span>
                  <p className="text-sm text-stone-500">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-stone-600 font-medium mb-1">
          Nenašli jsme žádné výsledky
        </p>
        <p className="text-sm text-stone-500 mb-4">
          pro &quot;{query}&quot;
        </p>
        <div className="text-sm text-stone-500 space-y-1">
          <p>Zkuste:</p>
          <ul className="list-disc list-inside text-left inline-block">
            <li>Použít jiná klíčová slova</li>
            <li>Zkontrolovat překlepy</li>
            <li>Prohlížet sekce pomocí menu</li>
          </ul>
        </div>
      </div>
    );
  }

  // Group results by type
  const grouped = groupResultsByType(results);

  // Calculate start indices for keyboard navigation
  let currentIndex = 0;
  const startIndices: Record<string, number> = {};

  for (const type of TYPE_DISPLAY_ORDER) {
    startIndices[type] = currentIndex;
    currentIndex += grouped[type].length;
  }

  return (
    <div className="overflow-y-auto max-h-[60vh] px-2">
      {TYPE_DISPLAY_ORDER.map((type) => (
        <SearchResultGroup
          key={type}
          type={type}
          results={grouped[type]}
          selectedIndex={selectedIndex}
          startIndex={startIndices[type]}
          onSelect={setSelectedIndex}
          onClose={closeSearch}
        />
      ))}
    </div>
  );
}
