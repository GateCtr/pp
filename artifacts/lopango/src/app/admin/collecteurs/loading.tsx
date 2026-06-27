export default function CollecteursLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-full" />
          <div className="h-3 w-56 bg-gray-100 rounded-full" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded-full" />
                <div className="h-3 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded-full" />
              <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
