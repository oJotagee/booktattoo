import { Skeleton } from '@/components/ui/skeleton';

interface ReminderListSkeletonProps {
  rows: number;
}

export function ReminderListSkeleton({ rows }: ReminderListSkeletonProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Lembretes</h2>
        <Skeleton className="size-7" />
      </header>

      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg border py-2 pr-2 pl-4">
            <Skeleton className="size-1.5 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="ml-auto size-8 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
