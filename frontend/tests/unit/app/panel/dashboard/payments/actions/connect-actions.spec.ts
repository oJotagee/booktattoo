import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { startOnboarding } = await import(
  '@/app/(panel)/dashboard/payments/_actions/start-onboarding'
);
const { openStripeDashboard } = await import(
  '@/app/(panel)/dashboard/payments/_actions/open-stripe-dashboard'
);

describe('startOnboarding', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    expect(await startOnboarding()).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the Stripe onboarding url', async () => {
    api.post.mockImplementationOnce(async () => ({
      data: { url: 'https://connect.stripe.com/setup/e/acct' },
    }));

    const result = await startOnboarding();

    expect(api.post).toHaveBeenCalledWith('/billing/connect/onboarding', undefined, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ url: 'https://connect.stripe.com/setup/e/acct' });
  });
});

describe('openStripeDashboard', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns the Express dashboard url', async () => {
    api.post.mockImplementationOnce(async () => ({
      data: { url: 'https://connect.stripe.com/express/acct' },
    }));

    expect(await openStripeDashboard()).toEqual({
      url: 'https://connect.stripe.com/express/acct',
    });
    expect(api.post).toHaveBeenCalledWith('/billing/connect/dashboard', undefined, {
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('returns the API error message when onboarding is not submitted', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'ConnectedAccountNotReadyError',
        message: 'A conta Stripe do tatuador ainda não está habilitada para receber pagamentos.',
      });
    });

    expect(await openStripeDashboard()).toEqual({
      error: 'A conta Stripe do tatuador ainda não está habilitada para receber pagamentos.',
    });
  });
});
