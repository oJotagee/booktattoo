import { Skeleton } from '@/components/ui/skeleton';

export function RequestCardSkeletons({ items }: { items: number }) {
  const keys = Array.from({ length: items }, (_, index) => `request-skeleton-${index}`);

  return keys.map((key) => <Skeleton key={key} className="h-24 rounded-xl" />);
}

export function RequestsPageSkeleton({ items }: { items: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <RequestCardSkeletons items={items} />
      </div>
    </div>
  );
}
