'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export async function updateServiceStatus({ id, status }: { id: string; status: boolean }) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    await api.patch(
      `/services/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    revalidatePath('/dashboard/services');

    return { data: 'Status atualizado com sucesso' };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar o status do serviço' };
  }
}
