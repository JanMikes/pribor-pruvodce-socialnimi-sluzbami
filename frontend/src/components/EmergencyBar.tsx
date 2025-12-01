import { getEmergencyNumbers } from '@/lib/strapi';

export default async function EmergencyBar() {
  const emergencyNumbers = await getEmergencyNumbers();

  if (emergencyNumbers.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 sm:gap-8 py-2.5 text-sm overflow-x-auto">
          <span className="font-semibold whitespace-nowrap hidden sm:inline tracking-wide uppercase text-xs text-secondary-100">
            Tísňová čísla:
          </span>
          {emergencyNumbers.slice(0, 4).map((emergency) => (
            <a
              key={emergency.id}
              href={`tel:${emergency.phone || (emergency.phones?.[0])}`}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-full transition-all whitespace-nowrap group"
            >
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              <span className="font-bold">{emergency.phone || emergency.phones?.[0]}</span>
              <span className="hidden md:inline text-secondary-100 text-xs">({emergency.name})</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
