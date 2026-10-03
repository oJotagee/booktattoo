import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { createCheckout } = await import('@/app/(panel)/dashboard/plans/_actions/create-checkout');

describe('createCheckout', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    expect(await createCheckout('BASIC')).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('requests the checkout session for the plan and returns its url', async () => {
    api.post.mockImplementationOnce(async () => ({
      data: { url: 'https://checkout.stripe.com/x' },
    }));

    const result = await createCheckout('PROFESSIONAL');

    expect(api.post).toHaveBeenCalledWith(
      '/billing/checkout',
      { plan: 'PROFESSIONAL' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(result).toEqual({ url: 'https://checkout.stripe.com/x' });
  });

  it('returns the API error message when the user already subscribes', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, { message: 'Usuário já possui uma assinatura ativa.' });
    });

    expect(await createCheckout('BASIC')).toEqual({
      error: 'Usuário já possui uma assinatura ativa.',
    });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    expect(await createCheckout('BASIC')).toEqual({
      error: 'Não foi possível iniciar o checkout',
    });
  });
});
