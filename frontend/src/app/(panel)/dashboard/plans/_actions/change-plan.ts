'use server';

import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import type { PlanId } from '@/utils/plans';
import { api } from '@/lib/api';

export async function changePlan(plan: PlanId): Promise<{ plan?: PlanId; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.post<{ plan: PlanId }>(
      '/billing/change-plan',
      { plan },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return { plan: data.plan };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível alterar o plano' };
  }
}
