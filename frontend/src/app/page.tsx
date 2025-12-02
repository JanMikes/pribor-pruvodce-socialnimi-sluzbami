import Link from 'next/link';
import { getLifeSituationsWithProviderCounts, getCrisisLines } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [lifeSituations, crisisLines] = await Promise.all([
    getLifeSituationsWithProviderCounts(),
    getCrisisLines(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28">
          <div className="max-w-4xl">
            {/* City Logo */}
            <img
              src="/logo-pribor.svg"
              alt="Město Příbor"
              className="h-8 sm:h-10 mb-12 brightness-0 invert"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance tracking-tight">
                Průvodce sociálními službami a navazujícími aktivitami
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mb-10 leading-relaxed">
                ve městě příbor a jeho přilehlém okolí pro pomoc a podporu v různých životních situacích.
            </p>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16" viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none">
            <path d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 0.300012 600 10 720 16.7C840 23 960 27 1080 25.3C1200 23 1320 17 1380 13.7L1440 11V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" fill="#faf9f7"/>
          </svg>
        </div>
      </section>

      {/* Life Situations Grid */}
      <section className="section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-heading text-stone-900 mb-4">
              Kdo mi pomůže?
            </h2>
            <p className="text-stone-600 max-w-2xl text-lg">
              Vyberte životní situaci, která Vás trápí, a my Vám ukážeme dostupnou pomoc.
            </p>
          </div>

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
                    <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors">
                      {situation.name} <span className="text-stone-400 font-normal">({situation.actualProviderCount})</span>
                    </h3>
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
      </section>

      {/* Quick Links Section */}
      <section className="section-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-heading text-stone-900 mb-4">
              Další důležité informace
            </h2>
            <p className="text-stone-600 max-w-2xl">
              Rychlý přístup ke krizovým linkám, zdravotnickým službám a úřadům.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crisis Lines Preview */}
            <div className="card-secondary flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div className="icon-box icon-box-secondary icon-box-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Krizové linky</h3>
                  <p className="text-sm text-stone-500">Pomoc v nouzi</p>
                </div>
              </div>
              <ul className="space-y-3 mb-5">
                {crisisLines.slice(0, 3).map((line) => (
                  <li key={line.id} className="flex items-center justify-between text-sm bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-stone-700 truncate font-medium">{line.name}</span>
                    {line.phone && (
                      <a href={`tel:${line.phone}`} className="text-secondary-600 font-bold hover:text-secondary-700 transition-colors">
                        {line.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/krizove-linky"
                className="btn-secondary w-full justify-center text-sm mt-auto"
              >
                Zobrazit všechny linky
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Healthcare */}
            <div className="card-success flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div className="icon-box icon-box-success icon-box-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Zdravotnictví</h3>
                  <p className="text-sm text-stone-500">Lékaři a lékárny</p>
                </div>
              </div>
              <p className="text-stone-600 mb-5 leading-relaxed">
                Přehled lékařů, zubních lékařů, lékáren a dalších zdravotnických zařízení v Příboře.
              </p>
              <Link
                href="/zdravotnictvi"
                className="btn w-full justify-center text-sm bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-lg shadow-success-500/25 mt-auto"
              >
                Zobrazit zdravotnictví
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Authorities */}
            <div className="card-accent flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <div className="icon-box icon-box-accent icon-box-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Úřady</h3>
                  <p className="text-sm text-stone-500">Státní instituce</p>
                </div>
              </div>
              <p className="text-stone-600 mb-5 leading-relaxed">
                Kontakty na městský úřad, úřad práce a další státní instituce.
              </p>
              <Link
                href="/urady"
                className="btn w-full justify-center text-sm bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 mt-auto"
              >
                Zobrazit úřady
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
