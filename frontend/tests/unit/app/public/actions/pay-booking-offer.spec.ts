import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { payBookingOffer } = await import('@/app/(public)/_actions/pay-booking-offer');

const TOKEN = 'conversation-1.signature';
const CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/cs_test_123';

describe('payBookingOffer', () => {
  beforeEach(() => {
    api.post.mockClear();
    api.post.mockImplementation(async () => ({ data: { checkoutUrl: CHECKOUT_URL } }));
  });

  it('rejects an invalid token before calling the API', async () => {
    const result = await payBookingOffer('not a token');

    expect(result).toEqual({ error: 'Conversa não encontrada' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('starts the checkout with the booking token', async () => {
    const result = await payBookingOffer(TOKEN);

    expect(api.post).toHaveBeenCalledWith(
      '/public/booking-requests/conversation/offer/pay',
      undefined,
      { headers: { 'X-Booking-Token': TOKEN } },
    );
    expect(result).toEqual({ data: { checkoutUrl: CHECKOUT_URL } });
  });

  it('returns the API error when the slot is taken', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'SlotUnavailableError',
        message: 'Este horário não está mais disponível.',
      });
    });

    const result = await payBookingOffer(TOKEN);

    expect(result).toEqual({ error: 'Este horário não está mais disponível.' });
  });

  it('returns the fallback message on server errors', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await payBookingOffer(TOKEN);

    expect(result).toEqual({ error: 'Não foi possível iniciar o pagamento' });
  });
});
