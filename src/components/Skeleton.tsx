export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function ExternalDataSkeleton() {
  return (
    <div className="space-y-4">
      {/* ЕГРЮЛ Skeleton */}
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4" />
      </div>

      {/* БКИ Skeleton */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-2/3 h-4" />
      </div>

      {/* ФНС Skeleton */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-20 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-1/2 h-4" />
      </div>
    </div>
  );
}

export function ScoringSkeleton() {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-12 h-6" />
      </div>
      <Skeleton className="w-full h-3 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="w-32 h-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-8 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
