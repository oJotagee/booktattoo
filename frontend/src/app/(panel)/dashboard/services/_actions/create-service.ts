'use server';

import { revalidatePath } from 'next/cache';

import type { Service } from '../_data-access/get-all-services';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

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
    const { data } = await api.post<Service>('/services', input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/services');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível criar o serviço') };
  }
}
