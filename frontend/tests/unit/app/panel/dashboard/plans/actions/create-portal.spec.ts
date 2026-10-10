import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { createPortal } = await import('@/app/(panel)/dashboard/plans/_actions/create-portal');

describe('createPortal', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    expect(await createPortal()).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the billing portal url', async () => {
    api.post.mockImplementationOnce(async () => ({
      data: { url: 'https://billing.stripe.com/p' },
    }));

    const result = await createPortal();

    expect(api.post).toHaveBeenCalledWith('/billing/portal', undefined, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ url: 'https://billing.stripe.com/p' });
  });

  it('returns the API error message when the user never subscribed', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(404, { error: 'BillingCustomerNotFoundError', message: 'Nenhuma assinatura encontrada para este usuário.' });
    });

    expect(await createPortal()).toEqual({
      error: 'Nenhuma assinatura encontrada para este usuário.',
    });
  });
});
