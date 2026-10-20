'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { UserX } from 'lucide-react';

import { ARTIST_GRID_CLASS, ARTISTS_PAGE_SIZE, ArtistGridSkeleton } from './artist-grid-skeleton';
import { getAllArtists, type OutputArtist } from '../../_data-access/get-all-artists';
import { ListPagination } from '../../_components/list-pagination';
import { parsePageParam } from '@/lib/search-params';
import { ArtistCard } from './artist-card';

interface ArtistListProps {
  initialData?: { page: number; data: OutputArtist };
}

export function ArtistList({ initialData }: ArtistListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parsePageParam(searchParams.get('page'));
  const offset = (currentPage - 1) * ARTISTS_PAGE_SIZE;

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['public-artists', currentPage],
    queryFn: () => getAllArtists({ limit: ARTISTS_PAGE_SIZE, offset }),
    initialData: initialData?.page === currentPage ? initialData.data : undefined,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (isPending) return <ArtistGridSkeleton items={ARTISTS_PAGE_SIZE} />;

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
