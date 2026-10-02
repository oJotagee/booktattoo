'use server';

import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import type { Galery } from './get-all-galeries';
import { api } from '@/lib/api';

export async function getGaleryById(id: string): Promise<Galery | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const { data } = await api.get<Galery>(`/galeries/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data;
  } catch (error) {
    if (isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0)) {
      return null;
    }

    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
