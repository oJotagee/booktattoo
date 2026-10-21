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

const { withdrawBookingOffer } = await import(
  '@/app/(panel)/dashboard/requests/_actions/withdraw-booking-offer'
);

describe('withdrawBookingOffer', () => {
  beforeEach(() => {
    api.delete.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
    api.delete.mockImplementation(async () => ({ data: undefined }));
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await withdrawBookingOffer('request-1');

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('withdraws the offer and revalidates the requests list', async () => {
    const result = await withdrawBookingOffer('request-1');

    expect(api.delete).toHaveBeenCalledWith('/booking-requests/request-1/offer', {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/requests');
    expect(result).toEqual({ data: 'request-1' });
  });

  it('returns the API error when the client is paying', async () => {
    api.delete.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'OfferPaymentInProgressError',
        message: 'O cliente está pagando esta proposta.',
      });
    });

    const result = await withdrawBookingOffer('request-1');

    expect(result).toEqual({ error: 'O cliente está pagando esta proposta.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
