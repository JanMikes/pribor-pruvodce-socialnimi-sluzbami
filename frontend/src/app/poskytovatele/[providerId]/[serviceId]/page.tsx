import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceById } from '@/lib/strapi';
import type { ContactInfo as ContactInfoType } from '@/lib/types';
import { getAllPhones, getFirstPhone, ensureProtocol } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ providerId: string; serviceId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { serviceId } = await params;
  const service = await getServiceById(serviceId);

  if (!service) {
    return { title: 'Služba nenalezena | Průvodce sociálními službami Příbor' };
  }

  return {
    title: `${service.name} | Průvodce sociálními službami Příbor`,
    description: service.description || `Informace o službě ${service.name}`,
  };
}

function ContactInfo({ contact, className = '' }: { contact: ContactInfoType; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {contact.address && (
        <div className="flex items-start gap-3 text-stone-600">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{contact.address}</span>
        </div>
      )}
      {contact.phones && contact.phones.length > 0 && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-5 h-5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${getFirstPhone(contact.phones)}`} className="hover:text-primary-600 transition-colors">
            {getAllPhones(contact.phones)}
          </a>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-5 h-5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition-colors">
            {contact.email}
          </a>
        </div>
      )}
      {contact.website && (
        <div className="flex items-center gap-3 text-stone-600">
          <svg className="w-5 h-5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <a href={ensureProtocol(contact.website)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
            {contact.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
    </div>
  );
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { providerId, serviceId } = await params;
  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  const providerName = service.provider?.name || 'Poskytovatel';
  const providerSlug = service.provider?.providerId || providerId;

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-stone-500">
            <li>
              <Link href="/" className="hover:text-primary-600 transition-colors">Úvod</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/poskytovatele" className="hover:text-primary-600 transition-colors">Poskytovatelé</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href={`/poskytovatele/${providerSlug}`} className="hover:text-primary-600 transition-colors">
                {providerName}
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-stone-900 font-medium truncate">{service.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="card p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="icon-box icon-box-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-1">
                <Link href={`/poskytovatele/${providerSlug}`} className="hover:text-primary-600 transition-colors">
                  {providerName}
                </Link>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                {service.name}
              </h1>
              {service.description && (
                <p className="text-lg text-stone-600 leading-relaxed">{service.description}</p>
              )}
            </div>
          </div>

          {service.contacts && service.contacts.length > 0 && (
            <div className="space-y-4">
              {service.contacts.map((contact) => (
                <ContactInfo key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </div>

        {/* Back to provider link */}
        <Link
          href={`/poskytovatele/${providerSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zpět na {providerName}
        </Link>
      </div>
    </div>
  );
}
