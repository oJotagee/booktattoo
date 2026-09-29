'use server';

import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/get-access-token';

interface GetAllServideProps {
  limit: number;
  offset: number;
}

export interface PaginationService {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OutputService {
  list: Service[];
  pagination: PaginationService;
}

export async function getAllServices({
  limit,
  offset,
}: GetAllServideProps): Promise<OutputService> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const service = await api.get('/services', {
      params: {
        limit,
        offset,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      list: service.data.list,
      pagination: service.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
