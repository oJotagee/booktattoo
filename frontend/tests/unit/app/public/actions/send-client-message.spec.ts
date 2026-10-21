import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { sendClientMessage } = await import('@/app/(public)/_actions/send-client-message');

const TOKEN = 'cmVxLTE.c2lnbmF0dXJl';

const message = {
  id: 'message-2',
  author: 'CLIENT' as const,
  body: 'Pode ser em preto e cinza?',
  createdAt: '2026-10-20T15:00:00.000Z',
};

describe('sendClientMessage', () => {
  beforeEach(() => {
    api.post.mockClear();
    api.post.mockImplementation(async () => ({ data: message }));
  });

  it('sends the trimmed message with the token in the header', async () => {
    const result = await sendClientMessage({
      token: TOKEN,
      body: '  Pode ser em preto e cinza?  ',
    });

    expect(api.post).toHaveBeenCalledWith(
      '/public/booking-requests/conversation/messages',
      { body: 'Pode ser em preto e cinza?' },
      { headers: { 'X-Booking-Token': TOKEN } },
    );
    expect(result).toEqual({ data: message });
  });

  it('never calls the API with a malformed token', async () => {
    const result = await sendClientMessage({ token: 'invalid token', body: 'Oi' });

    expect(result).toEqual({ error: 'Conversa não encontrada' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects an empty message', async () => {
    const result = await sendClientMessage({ token: TOKEN, body: '   ' });

    expect(result).toEqual({ error: 'Escreva uma mensagem' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('keeps the generic text for gateway rate limits', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(429, { message: 'API rate limit exceeded' });
    });

    const result = await sendClientMessage({ token: TOKEN, body: 'Oi' });

    expect(result).toEqual({
      error: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
    });
  });

  it('returns the closed conversation error from the API', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'BookingRequestClosedError',
        message: 'Esta conversa foi encerrada.',
      });
    });

    const result = await sendClientMessage({ token: TOKEN, body: 'Oi' });

    expect(result).toEqual({ error: 'Esta conversa foi encerrada.' });
  });

  it('returns the message limit error instead of the generic 429 text', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(429, {
        error: 'ClientMessageLimitError',
        message: 'Aguarde a resposta do tatuador para mandar mais mensagens.',
      });
    });

    const result = await sendClientMessage({ token: TOKEN, body: 'Oi' });

    expect(result).toEqual({
      error: 'Aguarde a resposta do tatuador para mandar mais mensagens.',
    });
  });
});
