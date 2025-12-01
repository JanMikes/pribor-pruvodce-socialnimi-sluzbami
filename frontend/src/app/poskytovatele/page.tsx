import Link from 'next/link';
import { getProviders } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Poskytovatelé služeb | Průvodce sociálními službami Příbor',
  description: 'Kompletní seznam poskytovatelů sociálních služeb v Příboře.',
};

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="icon-box icon-box-lg mx-auto mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Poskytovatelé služeb
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Kompletní přehled organizací poskytujících sociální služby v Příboře a okolí.
          </p>
        </div>

        {/* Providers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/poskytovatele/${provider.providerId}`}
              className="group card-interactive"
            >
              <div className="flex items-start gap-4">
                <div className="icon-box group-hover:scale-110 group-hover:shadow-glow-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-primary-700 transition-colors mb-2">
                    {provider.name}
                  </h2>
                  {provider.description && (
                    <p className="text-sm text-stone-600 line-clamp-2 mb-2">
                      {provider.description}
                    </p>
                  )}
                  {provider.services && provider.services.length > 0 && (
                    <p className="text-xs text-stone-500">
                      {provider.services.length} sluzb{provider.services.length === 1 ? 'a' : provider.services.length < 5 ? 'y' : ''}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-stone-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
