import { GaleryGridSkeleton } from './galery-grid-skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu } from '../../_components/menu';

interface GaleryPageSkeletonProps {
  items: number;
}

export function GaleryPageSkeleton({ items }: GaleryPageSkeletonProps) {
  return (
    <>
      <header className="flex flex-row justify-between gap-4 md:mb-8">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:block">
          <h1 className="text-xl md:text-2xl font-bold">Galeria</h1>
          <div className="flex h-6 items-center">
            <Skeleton className="h-4 w-44" />
          </div>
        </div>

        <Menu />
      </header>

      <h1 className="text-xl font-bold md:hidden">Galeria</h1>
      <div className="mb-4 flex h-5 items-center md:hidden">
        <Skeleton className="h-3.5 w-40" />
      </div>

      <GaleryGridSkeleton items={items} />
    </>
  );
}
