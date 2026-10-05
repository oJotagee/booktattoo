'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ImageOff } from 'lucide-react';
import { cn } from 'cn';

import { GALERY_GRID_CLASS, GaleryCardSkeletons, GaleryGridSkeleton } from './galery-grid-skeleton';
import { getAllPublicGaleries } from '../../_data-access/get-all-public-galeries';
import { ListPagination } from '../../_components/list-pagination';
import { getAllArtists } from '../../_data-access/get-all-artists';
import { GaleryCard } from './galery-card';
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

const PAGE_SIZE = 10;
const ARTISTS_LIMIT = 50;
const ALL_STYLES = 'ALL';

const STYLE_ITEMS = [
  { value: ALL_STYLES, label: 'Todos os estilos' },
  ...GALERY_STYLES.map((style) => ({ value: style, label: formatGaleryStyle(style) })),
];

export function GaleryList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1);
  const styleParam = searchParams.get('style');
  const style = isGaleryStyle(styleParam) ? styleParam : undefined;

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['public-galeries', currentPage, style],
    queryFn: () =>
      getAllPublicGaleries({
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
        style,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: artists } = useQuery({
    queryKey: ['public-artists', 'names'],
    queryFn: () => getAllArtists({ limit: ARTISTS_LIMIT, offset: 0 }),
    select: (result) => new Map(result.list.map((artist) => [artist.id, artist.name])),
    staleTime: 5 * 60 * 1000,
  });

  function navigate(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    update(params);
    router.push(`${pathname}?${params.toString()}`);
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

  if (isPending) return <GaleryGridSkeleton items={PAGE_SIZE} />;

  return (
    <div className="mt-10 flex flex-col gap-8">
      <Select
        items={STYLE_ITEMS}
        value={style ?? ALL_STYLES}
        onValueChange={(value) => handleStyleChange(isGaleryStyle(value) ? value : undefined)}
      >
        <SelectTrigger className="w-full text-white md:hidden" aria-label="Filtrar por estilo">
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

      {isError ? (
        <p className="text-center text-white/60">
          Não foi possível carregar a galeria, tente novamente mais tarde.
        </p>
      ) : isPlaceholderData ? (
        <div className={GALERY_GRID_CLASS}>
          <GaleryCardSkeletons items={Math.max(data.list.length, 1)} />
        </div>
      ) : data.list.length ? (
        <div className={GALERY_GRID_CLASS}>
          {data.list.map((galery) => (
            <GaleryCard key={galery.id} galery={galery} artistName={artists?.get(galery.userId)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-16 text-center text-white/60">
          <ImageOff className="size-8" />
          <p>
            {style
              ? `Nenhum flash ${formatGaleryStyle(style)} disponível.`
              : 'Nenhum flash disponível.'}
          </p>
        </div>
      )}

      {data && (
        <ListPagination
          page={currentPage}
          perPage={data.pagination.perPage}
          total={data.pagination.total}
          totalPages={data.pagination.totalPages}
          disabled={isPlaceholderData}
          onPageChange={handlePageChange}
        />
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
