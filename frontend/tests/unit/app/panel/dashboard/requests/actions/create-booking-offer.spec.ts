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

const { createBookingOffer } = await import(
  '@/app/(panel)/dashboard/requests/_actions/create-booking-offer'
);

const input = {
  id: 'request-1',
  title: 'Tatuagem personalizada',
  date: '2026-11-10',
  time: '14:00',
  duration: 120,
  price: 80000,
  depositAmount: 20000,
};

const offer = {
  id: 'offer-1',
  status: 'PENDING' as const,
  title: 'Tatuagem personalizada',
  scheduledAt: '2026-11-10T17:00:00.000Z',
  duration: 120,
  price: 80000,
  depositAmount: 20000,
  paymentInProgress: false,
  expired: false,
};

describe('createBookingOffer', () => {
  beforeEach(() => {
    api.post.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
    api.post.mockImplementation(async () => ({ data: offer }));
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await createBookingOffer(input);

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sends the offer and revalidates the requests list', async () => {
    const result = await createBookingOffer(input);

    expect(api.post).toHaveBeenCalledWith(
      '/booking-requests/request-1/offer',
      {
        title: 'Tatuagem personalizada',
        date: '2026-11-10',
        time: '14:00',
        duration: 120,
        price: 80000,
        depositAmount: 20000,
      },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/requests');
    expect(result).toEqual({ data: offer });
  });

  it('rejects a deposit greater than the price before calling the API', async () => {
    const result = await createBookingOffer({ ...input, depositAmount: 90000 });

    expect(result).toEqual({ error: 'O sinal não pode ser maior que o valor total' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects a duration outside the 30 minute grid', async () => {
    const result = await createBookingOffer({ ...input, duration: 45 });

    expect(result).toEqual({ error: 'Use intervalos de 30 minutos' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the API error when the slot is taken', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'SlotUnavailableError',
        message: 'Este horário não está mais disponível.',
      });
    });

    const result = await createBookingOffer(input);

    expect(result).toEqual({ error: 'Este horário não está mais disponível.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
