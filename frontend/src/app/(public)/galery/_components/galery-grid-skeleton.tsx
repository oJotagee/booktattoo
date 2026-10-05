import { Skeleton } from '@/components/ui/skeleton';

export const GALERY_GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5';

interface GaleryGridSkeletonProps {
  items: number;
}

export function GaleryCardSkeletons({ items }: GaleryGridSkeletonProps) {
  return Array.from({ length: items }).map((_, index) => (
    <div key={index} className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-4 p-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  ));
}

export function GaleryGridSkeleton({ items }: GaleryGridSkeletonProps) {
  return (
    <div className="mt-10 flex flex-col gap-8">
      <Skeleton className="h-9 w-full md:hidden" />
      <div className="hidden flex-wrap gap-2 md:flex">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className={GALERY_GRID_CLASS}>
        <GaleryCardSkeletons items={items} />
      </div>
    </div>
  );
}
