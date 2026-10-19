import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));

const { getCurrentUser } = await import('@/app/(panel)/dashboard/_data-access/get-current-user');

describe('getCurrentUser', () => {
  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getCurrentUser()).rejects.toThrow('Usuário não autenticado');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('reads the logged user, with the saved working times, from the API', async () => {
    const user = {
      id: 'user-1',
      name: 'Teste',
      image: null,
      address: null,
      phone: null,
      bio: null,
      role: null,
      status: 'ACTIVE',
      times: ['08:00', '08:30'],
    };
    api.get.mockImplementationOnce(async () => ({ data: user }));

    const result = await getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/users/me', {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result.times).toEqual(['08:00', '08:30']);
  });
});
