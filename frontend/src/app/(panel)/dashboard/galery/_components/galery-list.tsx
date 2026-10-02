'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ImageOff, Plus } from 'lucide-react';
import { useTransition } from 'react';
import Link from 'next/link';
import { cn } from 'cn';

import {
  formatGaleryStyle,
  GALERY_STYLES,
  type GaleryStyle,
  isGaleryStyle,
} from '@/utils/formatGalery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Galery, PaginationGalery } from '../_data-access/get-all-galeries';
import { GALERY_GRID_CLASS, GaleryCardSkeletons } from './galery-grid-skeleton';
import { Button } from '@/components/ui/button';
import { GaleryCard } from './galery-card';

const ALL_STYLES = 'ALL';

const STYLE_ITEMS = [
  { value: ALL_STYLES, label: 'Todos os estilos' },
  ...GALERY_STYLES.map((style) => ({ value: style, label: formatGaleryStyle(style) })),
];

interface GaleryListProps {
  galeries: Galery[];
  pagination: PaginationGalery;
  style?: GaleryStyle;
}

export function GaleryList({ galeries, pagination, style }: GaleryListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  function navigate(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    update(params);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleStyleChange(next?: GaleryStyle) {
    navigate((params) => {
      params.delete('page');
      if (next) params.set('style', next);
      else params.delete('style');
    });
  }

  function handlePageChange(page: number) {
    navigate((params) => params.set('page', String(page)));
  }

  const totalPages = Math.max(pagination.totalPages, 1);
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.perPage + 1;
  const lastItem = Math.min(pagination.page * pagination.perPage, pagination.total);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Select
          items={STYLE_ITEMS}
          value={style ?? ALL_STYLES}
          onValueChange={(value) => handleStyleChange(isGaleryStyle(value) ? value : undefined)}
        >
          <SelectTrigger className="w-full md:hidden" aria-label="Filtrar por estilo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <fieldset className="hidden flex-wrap gap-2 md:flex" aria-label="Filtrar por estilo">
          <StyleChip active={!style} onClick={() => handleStyleChange()}>
            Todos
          </StyleChip>
          {GALERY_STYLES.map((item) => (
            <StyleChip key={item} active={style === item} onClick={() => handleStyleChange(item)}>
              {formatGaleryStyle(item)}
            </StyleChip>
          ))}
        </fieldset>

        <Button
          render={<Link href="/dashboard/galery/new" />}
          nativeButton={false}
          className="w-full sm:w-fit bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        >
          <Plus />
          Novo flash
        </Button>
      </div>

      {isNavigating ? (
        <div className={GALERY_GRID_CLASS}>
          <GaleryCardSkeletons items={Math.max(galeries.length, 1)} />
        </div>
      ) : galeries.length ? (
        <div className={GALERY_GRID_CLASS}>
          {galeries.map((galery) => (
            <GaleryCard key={galery.id} galery={galery} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <ImageOff className="size-8" />
          <p>
            {style
              ? `Nenhum flash ${formatGaleryStyle(style)} cadastrado.`
              : 'Nenhum flash cadastrado.'}
          </p>
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            {firstItem}–{lastItem} de {pagination.total}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              aria-label="Página anterior"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isNavigating}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              {pagination.page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              aria-label="Próxima página"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || isNavigating}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StyleChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function StyleChip({ active, onClick, children }: StyleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
        active
          ? 'border-orange-600 bg-orange-600 text-white'
          : 'bg-card text-muted-foreground hover:border-white/30 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
