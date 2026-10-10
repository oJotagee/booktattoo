import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { changePlan } = await import('@/app/(panel)/dashboard/plans/_actions/change-plan');

describe('changePlan', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    expect(await changePlan('BASIC')).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('requests the plan change with the bearer token', async () => {
    api.post.mockImplementationOnce(async () => ({ data: { plan: 'PROFESSIONAL' } }));

    const result = await changePlan('PROFESSIONAL');

    expect(api.post).toHaveBeenCalledWith(
      '/billing/change-plan',
      { plan: 'PROFESSIONAL' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(result).toEqual({ plan: 'PROFESSIONAL' });
  });

  it('returns the API error message when the plan is already active', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, { error: 'PlanAlreadyActiveError', message: 'Este já é o plano atual da assinatura.' });
    });

    expect(await changePlan('BASIC')).toEqual({
      error: 'Este já é o plano atual da assinatura.',
    });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    expect(await changePlan('BASIC')).toEqual({ error: 'Não foi possível alterar o plano' });
  });
});
