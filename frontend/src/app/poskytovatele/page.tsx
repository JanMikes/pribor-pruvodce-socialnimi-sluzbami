import { getProviders } from '@/lib/strapi';
import ProviderCard from './ProviderCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Poskytovatelé služeb | Průvodce sociálními službami Příbor',
  description: 'Kompletní seznam poskytovatelů sociálních služeb v Příboře.',
};

export default async function ProvidersPage() {
  const providers = await getProviders();

  // Sort providers alphabetically and track first occurrence of each letter
  const sortedProviders = [...providers].sort((a, b) =>
    a.name.localeCompare(b.name, 'cs')
  );

  const seenLetters = new Set<string>();
  const providersWithLetters = sortedProviders.map((provider) => {
    const firstLetter = provider.name.charAt(0).toUpperCase();
    const isFirstOfLetter = !seenLetters.has(firstLetter);
    if (isFirstOfLetter) {
      seenLetters.add(firstLetter);
    }
    return { provider, letter: isFirstOfLetter ? firstLetter : null };
  });

  return (
    <div className="section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="icon-box icon-box-lg mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Poskytovatelé služeb
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Kompletní přehled organizací poskytujících sociální služby v Příboře a okolí.
          </p>
        </div>

        {/* Letter Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from(seenLetters).map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Providers List */}
        <div className="space-y-4">
          {providersWithLetters.map(({ provider, letter }) => (
            <ProviderCard key={provider.id} provider={provider} letter={letter} />
          ))}
        </div>
      </div>
    </div>
  );
}
