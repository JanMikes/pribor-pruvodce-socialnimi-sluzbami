import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLifeSituationById } from '@/lib/strapi';
import type { Provider, Service, CrisisLine, ContactInfo as ContactInfoType } from '@/lib/types';
import { getAllPhones, getFirstPhone } from '@/lib/types';

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

function ProviderContactInfo({ contact }: { contact: ContactInfoType }) {
  return (
    <div className="space-y-2 text-sm">
      {contact.address && (
        <div className="flex items-start gap-2 text-stone-600">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{contact.address}</span>
        </div>
      )}
      {contact.phones && contact.phones.length > 0 && (
        <div className="flex items-center gap-2 text-stone-600">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${getFirstPhone(contact.phones)}`} className="hover:text-primary-600 transition-colors">
            {getAllPhones(contact.phones)}
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

function ProviderCard({ provider }: { provider: Provider }) {
  const contact = provider.contacts?.[0];

  return (
    <div className="card">
      <Link href={`/poskytovatele/${provider.providerId}`}>
        <h2 className="text-xl font-bold text-stone-900 hover:text-primary-600 transition-colors mb-2">
          {provider.name}
        </h2>
      </Link>

      {provider.description && (
        <p className="text-stone-600 mb-4 leading-relaxed">{provider.description}</p>
      )}

      {contact && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <ProviderContactInfo contact={contact} />
        </div>
      )}
    </div>
  );
}

function ServiceGroupCard({ provider, services }: { provider: { providerId: string; name: string }; services: Service[] }) {
  return (
    <div className="card">
      <Link href={`/poskytovatele/${provider.providerId}`}>
        <h2 className="text-xl font-bold text-stone-900 hover:text-primary-600 transition-colors mb-4">
          {provider.name}
        </h2>
      </Link>

      <div className="space-y-4">
        {services.map((service) => {
          const serviceContact = service.contacts?.[0];

          return (
            <div key={service.id} className="pl-4 border-l-2 border-primary-200">
              <Link href={`/poskytovatele/${provider.providerId}/${service.serviceId}`}>
                <h3 className="text-lg font-semibold text-stone-900 hover:text-primary-600 transition-colors mb-1">
                  {service.name}
                </h3>
              </Link>
              {service.description && (
                <p className="text-stone-600 mb-3 leading-relaxed text-sm">{service.description}</p>
              )}
              {serviceContact && (
                <ProviderContactInfo contact={serviceContact} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CrisisLineCard({ line }: { line: CrisisLine }) {
  const phone = getFirstPhone(line.phones);

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-stone-900 mb-2">
        {line.name}
      </h2>

      {line.description && (
        <p className="text-stone-600 mb-4 leading-relaxed">{line.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="btn-secondary text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </a>
        )}
        {line.availability && (
          <span className="badge-success">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {line.availability}
          </span>
        )}
        {line.free && (
          <span className="badge-success">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Volání zdarma
          </span>
        )}
      </div>
    </div>
  );
}

export default async function LifeSituationDetailPage({ params }: PageProps) {
  const { situationId } = await params;
  const situation = await getLifeSituationById(situationId);

  if (!situation) {
    notFound();
  }

  const providers = situation.providers || [];
  const services = situation.services || [];
  const crisisLines = situation.crisisLines || [];

  // Group services by their parent provider
  const servicesByProvider = new Map<string, { provider: { providerId: string; name: string }; services: Service[] }>();
  for (const service of services) {
    const pid = service.provider?.providerId || 'unknown';
    if (!servicesByProvider.has(pid)) {
      servicesByProvider.set(pid, {
        provider: service.provider || { providerId: 'unknown', name: 'Neznámý poskytovatel' },
        services: [],
      });
    }
    servicesByProvider.get(pid)!.services.push(service);
  }

  const totalCount = providers.length + servicesByProvider.size + crisisLines.length;

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
                {totalCount} poskytovatel{totalCount === 1 ? '' : totalCount < 5 ? 'é' : 'ů'} nabízí pomoc v této situaci.
              </p>
            </div>
          </div>
        </div>

        {/* Services grouped by provider */}
        {servicesByProvider.size > 0 && (
          <div className="space-y-5 mb-8">
            {[...servicesByProvider.values()].map(({ provider, services: groupedServices }) => (
              <ServiceGroupCard key={provider.providerId} provider={provider} services={groupedServices} />
            ))}
          </div>
        )}

        {/* Standalone Providers */}
        {providers.length > 0 && (
          <div className="space-y-5 mb-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}

        {/* Crisis Lines List */}
        {crisisLines.length > 0 && (
          <div className="space-y-5">
            {(servicesByProvider.size > 0 || providers.length > 0) && (
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-3 mt-8">
                <div className="icon-box icon-box-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                Krizové linky
              </h2>
            )}
            {crisisLines.map((line) => (
              <CrisisLineCard key={line.id} line={line} />
            ))}
          </div>
        )}

        {totalCount === 0 && (
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
