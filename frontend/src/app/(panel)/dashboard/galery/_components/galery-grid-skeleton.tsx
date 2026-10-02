import { Skeleton } from '@/components/ui/skeleton';

export const GALERY_GRID_CLASS =
  'grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5';

interface GaleryGridSkeletonProps {
  items: number;
}

export function GaleryCardSkeletons({ items }: GaleryGridSkeletonProps) {
  return Array.from({ length: items }).map((_, index) => (
    <div key={index} className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-6" />
        </div>
        <div className="flex items-center gap-2 border-t pt-2">
          <Skeleton className="h-3.5 w-6 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  ));
}

export function GaleryGridSkeleton({ items }: GaleryGridSkeletonProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="hidden flex-wrap gap-2 md:flex">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full sm:w-32" />
      </div>

      <div className={GALERY_GRID_CLASS}>
        <GaleryCardSkeletons items={items} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4 sm:justify-end">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="size-8" />
        </div>
      </div>
    </div>
  );
}
