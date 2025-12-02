import { getProviders } from '@/lib/strapi';
import ProviderCard from './ProviderCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Poskytovatelé služeb | Průvodce sociálními službami Příbor',
  description: 'Kompletní seznam poskytovatelů sociálních služeb v Příboře.',
};

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
        <div className="space-y-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}
