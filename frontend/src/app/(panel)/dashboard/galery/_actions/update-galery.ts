'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import type { Galery } from '../_data-access/get-all-galeries';
import type { GaleryStyle } from '@/utils/formatGalery';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export type UpdateGaleryInput = {
  id: string;
  title?: string;
  size?: string;
  price?: number;
  style?: GaleryStyle;
  serviceId?: string;
};

export async function updateGalery({
  id,
  ...body
}: UpdateGaleryInput): Promise<{ data?: Galery; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.put<Galery>(`/galeries/${id}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/galery');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar o flash' };
  }
}
