import { getHealthcareProviders } from '@/lib/strapi';
import { healthcareCategoryLabels, type HealthcareCategory, getAllPhones, getFirstPhone } from '@/lib/types';
import CategoryNavigation from './CategoryNavigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Zdravotnictví | Průvodce sociálními službami Příbor',
  description: 'Přehled lékařů, zubních lékařů, lékáren a dalších zdravotnických zařízení v Příboře.',
};

const categoryOrder: HealthcareCategory[] = [
  'generalPractitioner',
  'pediatrician',
  'dentist',
  'dentalHygiene',
  'gynecology',
  'surgery',
  'cardiology',
  'ophthalmology',
  'pulmonary',
  'allergology',
  'rehabilitation',
  'ent',
  'optician',
  'pharmacy',
];

export default async function HealthcarePage() {
  const providers = await getHealthcareProviders();

  // Group providers by category (merge physiotherapy into rehabilitation)
  const groupedProviders = providers.reduce((acc, provider) => {
    const category = provider.category === 'physiotherapy' ? 'rehabilitation' : provider.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {} as Record<HealthcareCategory, typeof providers>);

  // Sort categories by predefined order
  const sortedCategories = categoryOrder.filter(cat => groupedProviders[cat]?.length > 0);

  return (
    <div className="section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="icon-box icon-box-healthcare icon-box-lg mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Zdravotnictví
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Přehled zdravotnických zařízení, lékařů a lékáren v Příboře.
          </p>
        </div>

        {/* Category Navigation */}
        <CategoryNavigation
          categories={sortedCategories}
          counts={Object.fromEntries(
            sortedCategories.map(cat => [cat, groupedProviders[cat].length])
          ) as Record<HealthcareCategory, number>}
        />

        {/* Categories */}
        <div className="space-y-16">
          {sortedCategories.map((category) => (
            <section key={category} id={category}>
              <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                <div className="icon-box icon-box-healthcare">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                {healthcareCategoryLabels[category]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupedProviders[category].map((provider) => (
                  <div
                    key={provider.id}
                    className="card p-0 overflow-hidden"
                  >
                    {/* Provider Header */}
                    <div className="bg-healthcare-50 px-5 py-4 border-b border-healthcare-100">
                      <h3 className="font-bold text-stone-900">
                        {provider.name}
                      </h3>
                    </div>

                    {/* Provider Details */}
                    <div className="px-5 py-4">
                      <div className="space-y-2 text-sm">
                        {provider.address && (
                          <div className="flex items-start gap-2 text-stone-600">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{provider.address}</span>
                          </div>
                        )}
                        {provider.phones && provider.phones.length > 0 && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${getFirstPhone(provider.phones)}`} className="hover:text-healthcare-600 transition-colors">
                              {getAllPhones(provider.phones)}
                            </a>
                          </div>
                        )}
                        {provider.website && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:text-healthcare-600 truncate transition-colors">
                              {provider.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Staff */}
                      {provider.staff && provider.staff.length > 0 && (
                        <div className={provider.address || (provider.phones && provider.phones.length > 0) || provider.website ? 'mt-4 pt-4 border-t border-stone-100' : ''}>
                          <ul className="space-y-2">
                            {provider.staff.map((person, idx) => (
                              <li key={idx} className="text-sm">
                                <div className="font-medium text-stone-700">
                                  {person.name}
                                  {person.specialty && (
                                    <span className="font-normal text-stone-500"> — {person.specialty}</span>
                                  )}
                                </div>
                                {person.phone && (
                                  <div className="flex items-center gap-1.5 mt-0.5 text-stone-500">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href={`tel:${person.phone}`} className="hover:text-healthcare-600 transition-colors">{person.phone}</a>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
