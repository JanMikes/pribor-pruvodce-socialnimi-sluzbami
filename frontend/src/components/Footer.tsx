import Link from 'next/link';

const navigation = {
  main: [
    { name: 'Životní situace', href: '/zivotni-situace' },
    { name: 'Poskytovatelé', href: '/poskytovatele' },
    { name: 'Krizové linky', href: '/krizove-linky' },
    { name: 'Zdravotnictví', href: '/zdravotnictvi' },
    { name: 'Úřady', href: '/urady' },
  ],
  emergency: [
    { name: 'Tísňová linka', phone: '112' },
    { name: 'Záchranná služba', phone: '155' },
    { name: 'Policie', phone: '158' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />

      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 right-0">
        <svg className="w-full h-8 sm:h-12 rotate-180" viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none">
          <path d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 0.300012 600 10 720 16.7C840 23 960 27 1080 25.3C1200 23 1320 17 1380 13.7L1440 11V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" fill="#faf9f7"/>
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white block">
                  Průvodce službami
                </span>
                <span className="text-sm text-primary-200 font-medium">Město Příbor</span>
              </div>
            </div>
            <p className="text-sm text-primary-100 leading-relaxed">
              Informační portál sociálních služeb pro občany města Příbor.
              Najdete zde pomoc a podporu v různých životních situacích.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Rychlé odkazy</h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-100 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-primary-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Tísňová čísla</h3>
            <ul className="space-y-3">
              {navigation.emergency.map((item) => (
                <li key={item.name}>
                  <a
                    href={`tel:${item.phone}`}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 group hover:bg-white/20 transition-all border border-white/10"
                  >
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                      <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-primary-200 block">{item.name}</span>
                      <span className="text-white font-bold text-lg tracking-wide">{item.phone}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-primary-200">
            &copy; {new Date().getFullYear()} Město Příbor. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
}
