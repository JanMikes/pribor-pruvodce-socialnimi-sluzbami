import Link from 'next/link';
import { getProviders } from '@/lib/strapi';

export const metadata = {
  title: 'Poskytovatelé služeb | Průvodce sociálními službami Příbor',
  description: 'Kompletní seznam poskytovatelů sociálních služeb v Příboře.',
};

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Poskytovatelé služeb
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kompletní přehled organizací poskytujících sociální služby v Příboře a okolí.
          </p>
        </div>

        {/* Providers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/poskytovatele/${provider.providerId}`}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-2">
                    {provider.name}
                  </h2>
                  {provider.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {provider.description}
                    </p>
                  )}
                  {provider.services && provider.services.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {provider.services.length} sluzb{provider.services.length === 1 ? 'a' : provider.services.length < 5 ? 'y' : ''}
                    </p>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
