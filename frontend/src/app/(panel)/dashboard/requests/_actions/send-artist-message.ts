'use server';

import { revalidatePath } from 'next/cache';

import type { ConversationMessage } from '@/components/conversation/types';
import { messageSchema } from '@/components/conversation/message-schema';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

interface SendArtistMessageInput {
  id: string;
  body: string;
}

export async function sendArtistMessage({
  id,
  body,
}: SendArtistMessageInput): Promise<{ data?: ConversationMessage; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Mensagem inválida' };

  try {
    const { data } = await api.post<ConversationMessage>(
      `/booking-requests/${encodeURIComponent(id)}/messages`,
      parsed.data,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    revalidatePath('/dashboard/requests');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível enviar a mensagem') };
  }
}
