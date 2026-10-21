import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { createBookingRequest } = await import('@/app/(public)/_actions/create-booking-request');

const input = {
  artistId: 'user-1',
  name: 'Mariana Costa',
  email: 'mariana@email.com',
  phone: '(11) 99999-9999',
  message: 'Quero uma rosa fineline no antebraço, uns 10 cm.',
};

describe('createBookingRequest', () => {
  beforeEach(() => {
    api.post.mockClear();
    api.post.mockImplementation(async () => ({ data: { token: 'conversation-1.signature' } }));
  });

  it('creates the request with the phone digits only and returns the token', async () => {
    const result = await createBookingRequest(input);

    expect(api.post).toHaveBeenCalledWith('/public/booking-requests', {
      artistId: 'user-1',
      name: 'Mariana Costa',
      email: 'mariana@email.com',
      phone: '11999999999',
      message: 'Quero uma rosa fineline no antebraço, uns 10 cm.',
    });
    expect(result).toEqual({ data: { token: 'conversation-1.signature' } });
  });

  it('validates the input before calling the API', async () => {
    const result = await createBookingRequest({ ...input, message: 'Oi' });

    expect(result).toEqual({ error: 'Conte um pouco sobre a sua ideia' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects messages longer than 2000 characters', async () => {
    const result = await createBookingRequest({ ...input, message: 'a'.repeat(2001) });

    expect(result).toEqual({ error: 'A mensagem pode ter no máximo 2000 caracteres' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the domain error message from the API', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'OpenBookingRequestLimitError',
        message: 'Você já tem uma conversa aberta com este tatuador.',
      });
    });

    const result = await createBookingRequest(input);

    expect(result).toEqual({ error: 'Você já tem uma conversa aberta com este tatuador.' });
  });

  it('returns a generic error when the API fails', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(503);
    });

    const result = await createBookingRequest(input);

    expect(result).toEqual({ error: 'Não foi possível enviar o seu pedido' });
  });
});
