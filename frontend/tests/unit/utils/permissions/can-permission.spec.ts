import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));

const { canPermission } = await import('@/utils/permissions/can-permission');

function mockApi(access: Record<string, unknown>, total: number) {
  api.get.mockImplementation(async (...args: unknown[]) => {
    if (args[0] === '/users/me/plan') return { data: access };
    return { data: { pagination: { total } } };
  });
}

describe('canPermission', () => {
  beforeEach(() => {
    api.get.mockClear();
  });

  it('allows creating during the trial while below the limit', async () => {
    mockApi({ status: 'TRIAL', limits: { services: 20, galeries: 50 } }, 4);

    const result = await canPermission({ type: 'service' });

    expect(result).toEqual({
      hasPermission: true,
      status: 'TRIAL',
      expired: false,
      limit: 20,
      used: 4,
    });
    expect(api.get).toHaveBeenCalledWith('/services', {
      params: { limit: 1, offset: 0 },
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('blocks when the plan limit was reached', async () => {
    mockApi({ status: 'ACTIVE', limits: { services: 3, galeries: 5 } }, 5);

    const result = await canPermission({ type: 'galery' });

    expect(result).toMatchObject({ hasPermission: false, expired: false, limit: 5, used: 5 });
    expect(api.get).toHaveBeenCalledWith('/galeries', expect.anything());
  });

  it('blocks and flags as expired when the trial ended without subscription', async () => {
    mockApi({ status: 'EXPIRED', limits: null }, 0);

    const result = await canPermission({ type: 'service' });

    expect(result).toEqual({
      hasPermission: false,
      status: 'EXPIRED',
      expired: true,
      limit: null,
      used: 0,
    });
  });
});
