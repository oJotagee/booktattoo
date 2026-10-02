'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import type { Galery } from '../_data-access/get-all-galeries';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export async function createGalery(formData: FormData): Promise<{ data?: Galery; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.post<Galery>('/galeries', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    revalidatePath('/dashboard/galery');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível criar o flash' };
  }
}
