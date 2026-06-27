export default function GeoLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-gray-200 rounded-full" />
          <div className="h-3 w-72 bg-gray-100 rounded-full" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, col) => (
          <div key={col} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-200 rounded-full" />
              <div className="h-6 w-6 bg-gray-200 rounded-md" />
            </div>
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-14 bg-gray-100 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-3.5 w-3.5 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
