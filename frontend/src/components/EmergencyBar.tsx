const emergencyNumbers = [
  { name: 'Policie ČR', phone: '158' },
  { name: 'Hasičský záchranný sbor', phone: '150' },
  { name: 'Záchranná služba', phone: '155' },
  { name: 'Tísňová linka', phone: '112' },
];

export default function EmergencyBar() {
  return (
    <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-end gap-6 py-2 text-sm">
          {emergencyNumbers.map((item) => (
            <a
              key={item.phone}
              href={`tel:${item.phone}`}
              className="flex items-center gap-1.5 hover:underline whitespace-nowrap"
            >
              <span className="text-secondary-100">{item.name}</span>
              <span className="font-bold">{item.phone}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
