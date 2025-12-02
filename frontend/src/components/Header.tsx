'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSearchContext } from './search/SearchProvider';

const navigation = [
  { name: 'Životní situace', href: '/zivotni-situace' },
  { name: 'Poskytovatelé', href: '/poskytovatele' },
  { name: 'Krizové linky', href: '/krizove-linky' },
  { name: 'Zdravotnictví', href: '/zdravotnictvi' },
  { name: 'Úřady', href: '/urady' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openSearch } = useSearchContext();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm shadow-soft border-b border-stone-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary group-hover:shadow-lg transition-all">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-stone-800 tracking-tight">
                  Průvodce službami
                </span>
                <span className="block text-xs text-primary-600 font-medium -mt-0.5">
                  Příbor
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-stone-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            {/* Search button */}
            <button
              type="button"
              onClick={openSearch}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              aria-label="Vyhledávání"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden lg:inline">Hledat</span>
            </button>
          </div>

          {/* Mobile: search + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            {/* Mobile search button */}
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              aria-label="Vyhledávání"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Hamburger menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Otevřít menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 py-4">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium transition-all px-4 py-3 rounded-xl ${
                      active
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-stone-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
