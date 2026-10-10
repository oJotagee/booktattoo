'use server';

import { revalidatePath } from 'next/cache';

import type { Service } from '../_data-access/get-all-services';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export type UpdateServiceInput = {
  id: string;
  name?: string;
  duration?: number;
  depositAmount?: number;
};

export async function updateService({
  id,
  ...body
}: UpdateServiceInput): Promise<{ data?: Service; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.put<Service>(`/services/${id}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/services');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível atualizar o serviço') };
  }
}
