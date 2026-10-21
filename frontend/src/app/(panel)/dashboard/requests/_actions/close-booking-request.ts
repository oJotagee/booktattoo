'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export async function closeBookingRequest(id: string): Promise<{ data?: string; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    await api.patch(`/booking-requests/${encodeURIComponent(id)}/close`, undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/requests');

    return { data: id };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível encerrar a conversa') };
  }
}
