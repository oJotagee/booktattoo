'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export async function deleteGalery(id: string): Promise<{ data?: string; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    await api.delete(`/galeries/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/galery');

    return { data: id };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível excluir o item') };
  }
}
