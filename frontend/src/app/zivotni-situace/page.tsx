import Link from 'next/link';
import { getLifeSituations } from '@/lib/strapi';

export const metadata = {
  title: 'Životní situace | Průvodce sociálními službami Příbor',
  description: 'Vyberte svou životní situaci a najdete pomoc a podporu v Příboře.',
};

export default async function LifeSituationsPage() {
  const lifeSituations = await getLifeSituations();

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Životní situace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vyberte situaci, která Vás momentálně trápí, a my Vám ukážeme dostupné služby a pomoc.
          </p>
        </div>

        {/* Situations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifeSituations.map((situation) => (
            <Link
              key={situation.id}
              href={`/zivotni-situace/${situation.situationId}`}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                    {situation.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {situation.providerRefs.length} poskytovatel{situation.providerRefs.length === 1 ? '' : situation.providerRefs.length < 5 ? 'e' : 'u'}
                  </p>
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
