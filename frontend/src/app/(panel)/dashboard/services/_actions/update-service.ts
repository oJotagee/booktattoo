'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import type { Service } from '../_data_access/get-all-services';
import { getAccessToken } from '@/lib/get-access-token';
import { userServiceApi } from '@/lib/user-service-api';

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
    const { data } = await userServiceApi.put<Service>(`/services/${id}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/services');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar o serviço' };
  }
}
