'use server';

import type { PublicGalery } from './get-all-public-galeries';
import { api } from '@/lib/api';

export interface PublicGaleryDetail extends PublicGalery {
  available: boolean;
  service: {
    duration: number;
    depositAmount: number;
  };
}

export async function getPublicGalery(id: string): Promise<PublicGaleryDetail> {
  try {
    const galery = await api.get<PublicGaleryDetail>(`/public/galeries/${encodeURIComponent(id)}`);

    return galery.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
