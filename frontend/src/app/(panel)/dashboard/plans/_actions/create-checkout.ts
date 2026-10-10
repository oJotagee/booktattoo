'use server';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
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
    return { error: getApiErrorMessage(error, 'Não foi possível iniciar o pagamento. Tente novamente em instantes.') };
  }
}
