'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { UserX } from 'lucide-react';

import { ARTIST_GRID_CLASS, ArtistGridSkeleton } from './artist-grid-skeleton';
import { getAllArtists } from '../../_data-access/get-all-artists';
import { ListPagination } from '../../_components/list-pagination';
import { ArtistCard } from './artist-card';

const PAGE_SIZE = 12;

export function ArtistList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['public-artists', currentPage],
    queryFn: () => getAllArtists({ limit: PAGE_SIZE, offset }),
    placeholderData: keepPreviousData,
  });

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (isPending) return <ArtistGridSkeleton items={PAGE_SIZE} />;

  if (isError) {
    return (
      <p className="mt-10 text-center text-white/60">
        Não foi possível carregar os artistas, tente novamente mais tarde.
      </p>
    );
  }

  if (data.list.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-16 text-center text-white/60">
        <UserX className="size-8" />
        <p>Nenhum artista encontrado, crie uma conta para se tornar artista.</p>
      </div>
    );
  }

  return (
    <>
      {isPlaceholderData ? (
        <ArtistGridSkeleton items={data.list.length} />
      ) : (
        <div className={ARTIST_GRID_CLASS}>
          {data.list.map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} position={offset + index + 1} />
          ))}
        </div>
      )}

      <ListPagination
        page={currentPage}
        perPage={data.pagination.perPage}
        total={data.pagination.total}
        totalPages={data.pagination.totalPages}
        disabled={isPlaceholderData}
        className="mt-10"
        onPageChange={handlePageChange}
      />
    </>
  );
}
