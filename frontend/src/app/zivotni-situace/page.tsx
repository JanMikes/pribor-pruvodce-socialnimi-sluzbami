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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
          {lifeSituations.map((situation, index) => (
            <Link
              key={situation.id}
              href={`/zivotni-situace/${situation.situationId}`}
              className="group card-interactive"
            >
              <div className="flex items-center gap-4">
                <div className="icon-box group-hover:scale-110 group-hover:shadow-glow-primary">
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-primary-700 transition-colors">
                    {situation.name} <span className="text-stone-400 font-normal">({situation.actualProviderCount})</span>
                  </h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-primary-600 group-hover:translate-x-0.5 transition-all"
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
