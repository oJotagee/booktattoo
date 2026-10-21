import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { sendArtistMessage } = await import(
  '@/app/(panel)/dashboard/requests/_actions/send-artist-message'
);

const message = {
  id: 'message-3',
  author: 'ARTIST' as const,
  body: 'Consigo sim, fica R$ 400.',
  createdAt: '2026-10-20T16:00:00.000Z',
};

describe('sendArtistMessage', () => {
  beforeEach(() => {
    api.post.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
    api.post.mockImplementation(async () => ({ data: message }));
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await sendArtistMessage({ id: 'request-1', body: 'Oi' });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sends the message and revalidates the requests list', async () => {
    const result = await sendArtistMessage({ id: 'request-1', body: 'Consigo sim, fica R$ 400.' });

    expect(api.post).toHaveBeenCalledWith(
      '/booking-requests/request-1/messages',
      { body: 'Consigo sim, fica R$ 400.' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/requests');
    expect(result).toEqual({ data: message });
  });

  it('rejects an empty message before calling the API', async () => {
    const result = await sendArtistMessage({ id: 'request-1', body: '  ' });

    expect(result).toEqual({ error: 'Escreva uma mensagem' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the API error when the conversation is closed', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'BookingRequestClosedError',
        message: 'Esta conversa foi encerrada.',
      });
    });

    const result = await sendArtistMessage({ id: 'request-1', body: 'Oi' });

    expect(result).toEqual({ error: 'Esta conversa foi encerrada.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
