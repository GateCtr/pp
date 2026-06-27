export default function PlaquesTemplatesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-full" />
          <div className="h-3 w-64 bg-gray-100 rounded-full" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-40 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-36 bg-gray-200 rounded-full" />
              <div className="h-3 w-full bg-gray-100 rounded-full" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
                <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
