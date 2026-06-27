export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="h-7 w-48 bg-gray-200 rounded-full" />
          <div className="h-3 w-64 bg-gray-100 rounded-full" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded-full" />
              <div className="h-9 w-9 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded-full" />
            <div className="h-3 w-32 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 rounded-full" />
            <div className="h-4 w-20 bg-gray-100 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
