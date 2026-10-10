'use server';

import { revalidatePath } from 'next/cache';

import type { Galery } from '../_data-access/get-all-galeries';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
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
    return { error: getApiErrorMessage(error, 'Não foi possível criar o flash') };
  }
}
