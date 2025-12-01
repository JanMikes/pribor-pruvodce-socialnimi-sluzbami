import { getEmergencyNumbers } from '@/lib/strapi';

export default async function EmergencyBar() {
  const emergencyNumbers = await getEmergencyNumbers();

  if (emergencyNumbers.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary-600 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 text-sm overflow-x-auto">
          <span className="font-medium whitespace-nowrap hidden sm:inline">Tísňová čísla:</span>
          {emergencyNumbers.slice(0, 4).map((emergency) => (
            <a
              key={emergency.id}
              href={`tel:${emergency.phone || (emergency.phones?.[0])}`}
              className="flex items-center gap-1.5 hover:text-secondary-100 transition-colors whitespace-nowrap"
            >
              <svg
                className="w-4 h-4"
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
              <span className="font-semibold">{emergency.phone || emergency.phones?.[0]}</span>
              <span className="hidden md:inline text-secondary-200">({emergency.name})</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
