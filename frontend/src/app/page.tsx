import Link from 'next/link';
import { getLifeSituations, getCrisisLines } from '@/lib/strapi';

// Icons for life situations (based on common categories)
const situationIcons: Record<string, React.ReactNode> = {
  default: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default async function Home() {
  const [lifeSituations, crisisLines] = await Promise.all([
    getLifeSituations(),
    getCrisisLines(),
  ]);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Průvodce sociálními službami
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Informační portál pro občany města Příbor. Najdete pomoc a podporu
              v různých životních situacích.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/zivotni-situace"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Potřebuji pomoc
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/krizove-linky"
                className="inline-flex items-center px-6 py-3 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 transition-colors"
              >
                Krizové linky
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Life Situations Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              V jaké situaci se nacházíte?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vyberte životní situaci, která Vás trápí, a my Vám ukážeme dostupnou pomoc.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifeSituations.map((situation) => (
              <Link
                key={situation.id}
                href={`/zivotni-situace/${situation.situationId}`}
                className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    {situationIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                      {situation.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {situation.providerRefs.length} poskytovatel{situation.providerRefs.length === 1 ? '' : situation.providerRefs.length < 5 ? 'e' : 'u'}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0"
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
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Crisis Lines Preview */}
            <div className="bg-secondary-50 rounded-xl p-6 border border-secondary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary-600 text-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Krizové linky</h3>
              </div>
              <ul className="space-y-2 mb-4">
                {crisisLines.slice(0, 3).map((line) => (
                  <li key={line.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{line.name}</span>
                    {line.phone && (
                      <a href={`tel:${line.phone}`} className="text-secondary-600 font-medium hover:text-secondary-700">
                        {line.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/krizove-linky"
                className="text-secondary-600 font-medium text-sm hover:text-secondary-700 inline-flex items-center"
              >
                Zobrazit všechny
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Healthcare */}
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Zdravotnictví</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Přehled lékařů, zubních lékařů, lékáren a dalších zdravotnických zařízení v Příboře.
              </p>
              <Link
                href="/zdravotnictvi"
                className="text-primary-600 font-medium text-sm hover:text-primary-700 inline-flex items-center"
              >
                Zobrazit zdravotnictví
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Authorities */}
            <div className="bg-accent-50 rounded-xl p-6 border border-accent-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-600 text-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Úřady</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Kontakty na městský úřad, úřad práce a další státní instituce.
              </p>
              <Link
                href="/urady"
                className="text-accent-600 font-medium text-sm hover:text-accent-700 inline-flex items-center"
              >
                Zobrazit úřady
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
