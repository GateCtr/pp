export default function ParcellesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-full" />
          <div className="h-3 w-56 bg-gray-100 rounded-full" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-64 bg-gray-100 rounded-xl" />
        <div className="h-9 w-32 bg-gray-100 rounded-xl" />
        <div className="h-9 w-32 bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-gray-50">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="h-4 w-28 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 rounded-full" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-4 w-20 bg-gray-100 rounded-full" />
              <div className="h-7 w-20 bg-gray-100 rounded-lg ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
