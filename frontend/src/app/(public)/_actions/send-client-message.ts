'use server';

import { isAxiosError } from 'axios';

import type { ConversationMessage } from '@/components/conversation/types';
import { bookingTokenHeaders, isBookingToken } from '@/lib/booking-token';
import { messageSchema } from '@/components/conversation/message-schema';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

const CLIENT_MESSAGE_LIMIT_ERROR = 'ClientMessageLimitError';

interface SendClientMessageInput {
  token: string;
  body: string;
}

export async function sendClientMessage({
  token,
  body,
}: SendClientMessageInput): Promise<{ data?: ConversationMessage; error?: string }> {
  if (!isBookingToken(token)) return { error: 'Conversa não encontrada' };

  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Mensagem inválida' };

  try {
    const { data } = await api.post<ConversationMessage>(
      '/public/booking-requests/conversation/messages',
      parsed.data,
      { headers: bookingTokenHeaders(token) },
    );

    return { data };
  } catch (error) {
    return {
      error:
        messageLimitError(error) ?? getApiErrorMessage(error, 'Não foi possível enviar a mensagem'),
    };
  }
}

function messageLimitError(error: unknown): string | null {
  if (!isAxiosError(error)) return null;

  const body = error.response?.data as { error?: unknown; message?: unknown } | undefined;

  return body?.error === CLIENT_MESSAGE_LIMIT_ERROR && typeof body.message === 'string'
    ? body.message
    : null;
}
