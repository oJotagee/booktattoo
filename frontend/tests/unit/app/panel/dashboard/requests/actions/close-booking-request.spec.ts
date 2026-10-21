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

const { closeBookingRequest } = await import(
  '@/app/(panel)/dashboard/requests/_actions/close-booking-request'
);

describe('closeBookingRequest', () => {
  beforeEach(() => {
    api.patch.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await closeBookingRequest('request-1');

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('closes the conversation and revalidates the requests list', async () => {
    const result = await closeBookingRequest('request-1');

    expect(api.patch).toHaveBeenCalledWith('/booking-requests/request-1/close', undefined, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/requests');
    expect(result).toEqual({ data: 'request-1' });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'BookingRequestClosedError',
        message: 'Esta conversa já foi encerrada.',
      });
    });

    const result = await closeBookingRequest('request-1');

    expect(result).toEqual({ error: 'Esta conversa já foi encerrada.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
