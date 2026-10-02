'use server';

import type { GaleryStyle } from '@/utils/formatGalery';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

interface GetAllGaleriesProps {
  limit: number;
  offset: number;
  style?: GaleryStyle;
}

export interface PaginationGalery {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Galery {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OutputGalery {
  list: Galery[];
  pagination: PaginationGalery;
}

export async function getAllGaleries({
  limit,
  offset,
  style,
}: GetAllGaleriesProps): Promise<OutputGalery> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const galery = await api.get('/galeries', {
      params: {
        limit,
        offset,
        ...(style && { style }),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      list: galery.data.list,
      pagination: galery.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
