import Link from 'next/link';
import { getLifeSituationsWithProviderCounts } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Životní situace | Průvodce sociálními službami Příbor',
  description: 'Vyberte svou životní situaci a najdete pomoc a podporu v Příboře.',
};

export default async function LifeSituationsPage() {
  const lifeSituations = await getLifeSituationsWithProviderCounts();

  return (
    <div className="section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="icon-box icon-box-lg mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-heading text-stone-900 mb-4">
            Životní situace
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Vyberte situaci, která Vás momentálně trápí, a my Vám ukážeme dostupné služby a pomoc.
          </p>
        </div>

        {/* Situations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lifeSituations.map((situation) => (
            <Link
              key={situation.id}
              href={`/zivotni-situace/${situation.situationId}`}
              className="group card-interactive"
            >
              <div className="flex items-start gap-4">
                <div className="icon-box group-hover:scale-110 group-hover:shadow-glow-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-primary-700 transition-colors">
                    {situation.name} <span className="text-stone-400 font-normal">({situation.actualProviderCount})</span>
                  </h2>
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
