import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProviderById } from '@/lib/strapi';
import type { ContactInfo as ContactInfoType } from '@/lib/types';

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { providerId } = await params;
  const provider = await getProviderById(providerId);

  if (!provider) {
    return { title: 'Poskytovatel nenalezen | Průvodce sociálními službami Příbor' };
  }

  return {
    title: `${provider.name} | Průvodce sociálními službami Příbor`,
    description: provider.description || `Informace o poskytovateli ${provider.name}`,
  };
}

function ContactInfo({ contact, className = '' }: { contact: ContactInfoType; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {contact.address && (
        <div className="flex items-start gap-3 text-gray-600">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{contact.address}</span>
        </div>
      )}
      {(contact.phone || (contact.phones && contact.phones.length > 0)) && (
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${contact.phone || contact.phones?.[0]}`} className="hover:text-primary-600 transition-colors">
            {contact.phone || contact.phones?.join(', ')}
          </a>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition-colors">
            {contact.email}
          </a>
        </div>
      )}
      {contact.website && (
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
            {contact.website}
          </a>
        </div>
      )}
    </div>
  );
}

export default async function ProviderDetailPage({ params }: PageProps) {
  const { providerId } = await params;
  const provider = await getProviderById(providerId);

  if (!provider) {
    notFound();
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary-600">Úvod</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/poskytovatele" className="hover:text-primary-600">Poskytovatelé</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium truncate">{provider.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {provider.name}
          </h1>

          {provider.description && (
            <p className="text-lg text-gray-600 mb-6">{provider.description}</p>
          )}

          {provider.contact && (
            <ContactInfo contact={provider.contact} />
          )}
        </div>

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Služby</h2>
            <div className="space-y-4">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  )}
                  {service.contact && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Kontakt na službu:</h4>
                      <ContactInfo contact={service.contact} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
