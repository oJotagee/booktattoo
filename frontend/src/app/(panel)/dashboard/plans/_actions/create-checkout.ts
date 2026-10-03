'use server';

import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import type { PlanId } from '@/utils/plans';
import { api } from '@/lib/api';

export async function createCheckout(plan: PlanId): Promise<{ url?: string; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.post<{ url: string }>(
      '/billing/checkout',
      { plan },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return { url: data.url };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível iniciar o checkout' };
  }
}
