import { Skeleton } from '@/components/ui/skeleton';

export function PlansPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[440px] w-full rounded-2xl" />
        <Skeleton className="h-[440px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
