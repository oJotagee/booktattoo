import { Skeleton } from '@/components/ui/skeleton';

export const ARTIST_GRID_CLASS = 'mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6';

interface ArtistGridSkeletonProps {
  items: number;
}

export function ArtistGridSkeleton({ items }: ArtistGridSkeletonProps) {
  return (
    <div className={ARTIST_GRID_CLASS}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index}>
          <Skeleton className="aspect-4/5 w-full rounded-2xl" />
          <div className="flex flex-col gap-2 pt-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
