'use server';

import { api } from '@/lib/api';

interface GetAllArtistsProps {
  limit: number;
  offset: number;
}

export interface PaginationArtist {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Artist {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  role: string | null;
  status: string;
  times: string[];
}

interface OutputArtist {
  list: Artist[];
  pagination: PaginationArtist;
}

export async function getAllArtists({ limit, offset }: GetAllArtistsProps): Promise<OutputArtist> {
  try {
    const artists = await api.get('/public/artists', {
      params: {
        limit,
        offset,
      },
    });

    return {
      list: artists.data.list,
      pagination: artists.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
