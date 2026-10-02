'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export async function updateGaleryAvailability({
  id,
  available,
}: {
  id: string;
  available: boolean;
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    await api.patch(
      `/galeries/${id}/availability`,
      { available },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    revalidatePath('/dashboard/galery');

    return { data: 'Disponibilidade atualizada com sucesso' };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar a disponibilidade do flash' };
  }
}
