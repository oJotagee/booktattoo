import { getAllArtists } from '../../_data-access/get-all-artists';
import { ARTISTS_PAGE_SIZE } from './artist-grid-skeleton';
import { parsePageParam } from '@/lib/search-params';
import { ArtistList } from './artist-list';

interface ArtistListLoaderProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ArtistListLoader({ searchParams }: ArtistListLoaderProps) {
  const page = parsePageParam((await searchParams).page);

  const data = await getAllArtists({
    limit: ARTISTS_PAGE_SIZE,
    offset: (page - 1) * ARTISTS_PAGE_SIZE,
  }).catch(() => undefined);

  return <ArtistList initialData={data && { page, data }} />;
}
