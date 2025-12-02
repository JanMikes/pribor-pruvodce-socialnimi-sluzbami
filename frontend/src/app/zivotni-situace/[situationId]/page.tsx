import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLifeSituationById, getProvidersByIds } from '@/lib/strapi';
import type { Provider } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ situationId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { situationId } = await params;
  const situation = await getLifeSituationById(situationId);

  if (!situation) {
    return { title: 'Situace nenalezena | Průvodce sociálními službami Příbor' };
  }

  return {
    title: `${situation.name} | Průvodce sociálními službami Příbor`,
    description: `Poskytovatelé pomoci pro situaci: ${situation.name}`,
  };
}

function ContactInfo({ provider }: { provider: Provider }) {
  const contact = provider.contact;
  if (!contact) return null;

  return (
    <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-sm">
      {contact.address && (
        <div className="flex items-start gap-2 text-stone-600">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{contact.address}</span>
        </div>
      )}
      {(contact.phone || (contact.phones && contact.phones.length > 0)) && (
        <div className="flex items-center gap-2 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${contact.phone || contact.phones?.[0]}`} className="hover:text-primary-600 transition-colors">
            {contact.phone || contact.phones?.join(', ')}
          </a>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-2 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition-colors">
            {contact.email}
          </a>
        </div>
      )}
      {contact.website && (
        <div className="flex items-center gap-2 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default async function LifeSituationDetailPage({ params }: PageProps) {
  const { situationId } = await params;
  const situation = await getLifeSituationById(situationId);

  if (!situation) {
    notFound();
  }

  const providers = await getProvidersByIds(situation.providerRefs);

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
              <Link href="/zivotni-situace" className="hover:text-primary-600 transition-colors">Životní situace</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-stone-900 font-medium truncate">{situation.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="icon-box icon-box-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                {situation.name}
              </h1>
              <p className="text-lg text-stone-600">
                {providers.length} poskytovatel{providers.length === 1 ? '' : providers.length < 5 ? 'é' : 'ů'} nabízí pomoc v této situaci.
              </p>
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-5">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="card"
            >
              <Link href={`/poskytovatele/${provider.providerId}`}>
                <h2 className="text-xl font-bold text-stone-900 hover:text-primary-600 transition-colors mb-2">
                  {provider.name}
                </h2>
              </Link>

              {provider.description && (
                <p className="text-stone-600 mb-4 leading-relaxed">{provider.description}</p>
              )}

              {/* Services */}
              {provider.services && provider.services.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-stone-700 mb-2">Služby:</h3>
                  <ul className="space-y-1">
                    {provider.services.map((service) => (
                      <li key={service.id} className="text-sm text-stone-600 flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{service.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ContactInfo provider={provider} />
            </div>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-12 card">
            <svg className="w-12 h-12 text-stone-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-stone-600">Pro tuto situaci nebyli nalezeni žádní poskytovatelé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
