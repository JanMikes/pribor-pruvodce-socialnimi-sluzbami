'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Provider, ContactInfo as ContactInfoType } from '@/lib/types';
import { getAllPhones, getFirstPhone } from '@/lib/types';

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
      {contact.phones && contact.phones.length > 0 && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${getFirstPhone(contact.phones)}`} className="text-sm hover:text-primary-600 transition-colors">
            {getAllPhones(contact.phones)}
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
            {contact.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
    </div>
  );
}

export default function ProviderCard({ provider, letter }: { provider: Provider; letter: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const contact = provider.contacts?.[0];
  const hasContact = contact && (
    contact.address ||
    contact.phones?.length ||
    contact.email ||
    contact.website
  );

  return (
    <div id={letter ? `letter-${letter}` : undefined} className="card scroll-mt-24">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-4">
          {letter ? (
            <div className={`icon-box transition-all ${isOpen ? 'bg-primary-100 text-primary-600' : ''}`}>
              <span className="text-lg font-bold">{letter}</span>
            </div>
          ) : (
            <div className="w-12 h-12 flex-shrink-0" />
          )}
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
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? 'bg-primary-100' : 'bg-primary-50'}`}>
            <svg
              className={`w-4 h-4 transition-transform text-primary-600 ${isOpen ? 'rotate-180' : ''}`}
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
        <>
          <div className="mt-4 pt-4 border-t border-stone-100 ml-16">
            {provider.description && (
              <p className="text-sm text-stone-600 mb-4">
                {provider.description}
              </p>
            )}

            {hasContact && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Kontakt</h3>
                <ContactInfo contact={contact!} />
              </div>
            )}

            {provider.services && provider.services.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Služby</h3>
                <ul className="space-y-1">
                  {provider.services.map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`/poskytovatele/${provider.providerId}/${service.serviceId}`}
                        className="text-sm text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 -mx-6 -mb-6 px-6 py-4 bg-primary-50 rounded-b-2xl flex justify-end">
            <Link
              href={`/poskytovatele/${provider.providerId}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Zobrazit detail a všechny služby &gt;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
