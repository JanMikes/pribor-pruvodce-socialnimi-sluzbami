'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Provider, ContactInfo as ContactInfoType } from '@/lib/types';

function ContactInfo({ contact }: { contact: ContactInfoType }) {
  return (
    <div className="space-y-2">
      {contact.address && (
        <div className="flex items-start gap-3 text-stone-600">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{contact.address}</span>
        </div>
      )}
      {(contact.phone || (contact.phones && contact.phones.length > 0)) && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${contact.phone || contact.phones?.[0]}`} className="text-sm hover:text-primary-600 transition-colors">
            {contact.phone || contact.phones?.join(', ')}
          </a>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${contact.email}`} className="text-sm hover:text-primary-600 transition-colors">
            {contact.email}
          </a>
        </div>
      )}
      {contact.website && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary-600 transition-colors">
            {contact.website}
          </a>
        </div>
      )}
    </div>
  );
}

export default function ProviderCard({ provider }: { provider: Provider }) {
  const [isOpen, setIsOpen] = useState(false);

  const hasContact = provider.contact && (
    provider.contact.address ||
    provider.contact.phone ||
    provider.contact.phones?.length ||
    provider.contact.email ||
    provider.contact.website
  );

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4">
          <div className={`icon-box transition-all ${isOpen ? 'bg-primary-100 text-primary-600' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-lg font-bold transition-colors ${isOpen ? 'text-primary-700' : 'text-stone-900'}`}>
                {provider.name}
              </h2>
              {provider.services && provider.services.length > 0 && (
                <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {provider.services.length} služb{provider.services.length === 1 ? 'a' : provider.services.length < 5 ? 'y' : ''}
                </span>
              )}
            </div>
            {provider.description && (
              <p className="text-sm text-stone-600 line-clamp-2 mt-1">
                {provider.description}
              </p>
            )}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? 'bg-primary-100' : 'bg-stone-100'}`}>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-primary-600' : 'text-stone-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {hasContact && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Kontakt</h3>
              <ContactInfo contact={provider.contact!} />
            </div>
          )}

          <Link
            href={`/poskytovatele/${provider.providerId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
          >
            Zobrazit detail a všechny služby
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
