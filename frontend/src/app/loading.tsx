export default function Loading() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600">Načítání...</p>
      </div>
    </div>
  );
}
