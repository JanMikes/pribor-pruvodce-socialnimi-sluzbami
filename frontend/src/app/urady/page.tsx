import { getAuthorities } from '@/lib/strapi';

export const metadata = {
  title: 'Úřady | Průvodce sociálními službami Příbor',
  description: 'Kontakty na městský úřad, úřad práce a další státní instituce v Příboře.',
};

export default async function AuthoritiesPage() {
  const authorities = await getAuthorities();

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="icon-box icon-box-accent icon-box-lg mx-auto mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Úřady
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Kontakty na městský úřad, úřad práce a další státní instituce.
          </p>
        </div>

        {/* Authorities List */}
        <div className="space-y-8">
          {authorities.map((authority) => (
            <div
              key={authority.id}
              className="card p-0 overflow-hidden"
            >
              {/* Authority Header */}
              <div className="bg-gradient-to-br from-accent-50 to-surface px-6 py-5 border-b border-accent-100">
                <div className="flex items-start gap-4">
                  <div className="icon-box icon-box-accent icon-box-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-stone-900 mb-2">
                      {authority.name}
                    </h2>
                    <div className="space-y-1 text-sm text-stone-600">
                      {authority.address && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{authority.address}</span>
                        </div>
                      )}
                      {authority.website && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <a href={authority.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">
                            {authority.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments */}
              {authority.departments && authority.departments.length > 0 && (
                <div className="divide-y divide-stone-100">
                  {authority.departments.map((department) => (
                    <div key={department.id} className="px-6 py-5">
                      <h3 className="font-bold text-stone-900 mb-2">
                        {department.name}
                      </h3>

                      {department.description && (
                        <p className="text-sm text-stone-600 mb-3 leading-relaxed">{department.description}</p>
                      )}

                      <div className="space-y-2 text-sm">
                        {department.address && (
                          <div className="flex items-start gap-2 text-stone-600">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{department.address}</span>
                          </div>
                        )}
                        {department.phone && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${department.phone}`} className="hover:text-accent-600 transition-colors">
                              {department.phone}
                            </a>
                          </div>
                        )}
                        {department.email && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${department.email}`} className="hover:text-accent-600 transition-colors">
                              {department.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Contacts */}
                      {department.contacts && department.contacts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-stone-100">
                          <h4 className="text-xs font-semibold text-stone-500 uppercase mb-3">Kontaktní osoby</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {department.contacts.map((contact, idx) => (
                              <div key={idx} className="bg-stone-50 rounded-xl p-3">
                                <div className="font-semibold text-stone-900 text-sm">{contact.role}</div>
                                <div className="space-y-1 mt-1 text-sm">
                                  {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="block text-stone-600 hover:text-accent-600 transition-colors">
                                      {contact.phone}
                                    </a>
                                  )}
                                  {contact.email && (
                                    <a href={`mailto:${contact.email}`} className="block text-stone-600 hover:text-accent-600 truncate transition-colors">
                                      {contact.email}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
