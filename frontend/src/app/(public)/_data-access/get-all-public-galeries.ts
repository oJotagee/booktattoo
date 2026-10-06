'use server';

import type { GaleryStyle } from '@/utils/formatGalery';
import { api } from '@/lib/api';

interface GetAllPublicGaleriesProps {
  limit: number;
  offset: number;
  style?: GaleryStyle;
  userId?: string;
}

export interface PaginationPublicGalery {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PublicGalery {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  userId: string;
  artistName: string | null;
  serviceId: string;
}

interface OutputPublicGalery {
  list: PublicGalery[];
  pagination: PaginationPublicGalery;
}

export async function getAllPublicGaleries({
  limit,
  offset,
  style,
  userId,
}: GetAllPublicGaleriesProps): Promise<OutputPublicGalery> {
  try {
    const galeries = await api.get('/public/galeries', {
      params: {
        limit,
        offset,
        ...(style && { style }),
        ...(userId && { userId }),
      },
    });

    return {
      list: galeries.data.list,
      pagination: galeries.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
