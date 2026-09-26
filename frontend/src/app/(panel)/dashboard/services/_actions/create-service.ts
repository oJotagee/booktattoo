'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import type { Service } from '../_data_access/get-all-services';
import { getAccessToken } from '@/lib/get-access-token';
import { catalogServiceApi } from '@/lib/catalog-service-api';

export type CreateServiceInput = {
  name: string;
  duration: number;
  depositAmount: number;
};

export async function createService(
  input: CreateServiceInput,
): Promise<{ data?: Service; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await catalogServiceApi.post<Service>('/services', input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/services');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível criar o serviço' };
  }
}
