'use server';

import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
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
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível abrir o portal da assinatura' };
  }
}
