'use server';

import { isAxiosError } from 'axios';

import type { Artist } from './get-all-artists';
import { api } from '@/lib/api';

const ARTIST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function getPublicArtist(id: string): Promise<Artist | null> {
  if (!ARTIST_ID_PATTERN.test(id)) return null;

  try {
    const artist = await api.get<Artist>(`/public/artists/${encodeURIComponent(id)}`);

    return artist.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;

    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
