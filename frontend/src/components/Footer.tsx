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
    { name: 'Tísňová linka: 112', href: 'tel:112' },
    { name: 'Záchranná služba: 155', href: 'tel:155' },
    { name: 'Policie: 158', href: 'tel:158' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-lg font-semibold text-gray-900">
                Průvodce službami
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Informační portál sociálních služeb pro občany města Příbor.
              Najdete zde pomoc a podporu v různých životních situacích.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Rychlé odkazy</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tísňová čísla</h3>
            <ul className="space-y-2">
              {navigation.emergency.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Město Příbor. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
}
