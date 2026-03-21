const SkeletonCard = () => <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />

const DashboardSkeleton = () => {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1240px] grid-cols-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[260px_1fr] lg:py-6">
      <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
      </div>
    </div>
  )
}

export default DashboardSkeleton
