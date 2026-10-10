'use server';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export async function createPortal(): Promise<{ url?: string; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.post<{ url: string }>('/billing/portal', undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return { url: data.url };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível abrir o portal da assinatura') };
  }
}
