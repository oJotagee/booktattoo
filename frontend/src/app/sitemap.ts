import type { MetadataRoute } from 'next';

import { getAllArtists } from './(public)/_data-access/get-all-artists';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

const ARTISTS_PAGE_SIZE = 50;

async function getAllArtistIds(): Promise<string[]> {
  const ids: string[] = [];
  let offset = 0;
  let totalPages = 1;

  for (let page = 0; page < totalPages; page++) {
    const { list, pagination } = await getAllArtists({ limit: ARTISTS_PAGE_SIZE, offset });
    ids.push(...list.map((artist) => artist.id));
    totalPages = pagination.totalPages;
    offset += pagination.perPage;
  }

  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/galery`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/artists`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const artistIds = await getAllArtistIds().catch(() => []);

  return [
    ...staticRoutes,
    ...artistIds.map((id) => ({
      url: `${SITE_URL}/${id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
