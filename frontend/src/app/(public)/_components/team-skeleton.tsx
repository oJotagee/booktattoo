import { Skeleton } from '@/components/ui/skeleton';

interface TeamSkeletonProps {
  items: number;
}

export function TeamSkeleton({ items }: TeamSkeletonProps) {
  return (
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index}>
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
