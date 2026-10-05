import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));

const { getAllReminders } = await import('@/app/(panel)/dashboard/_data-access/get-all-reminders');

describe('getAllReminders', () => {
  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getAllReminders({ limit: 10, offset: 0 })).rejects.toThrow(
      'Usuário não autenticado',
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it('requests the page with limit/offset and returns the list with pagination', async () => {
    const list = [
      {
        id: 'reminder-1',
        description: 'Enviar confirmação para Mariana (09:00)',
        userId: 'user-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ];
    const pagination = { total: 1, page: 1, perPage: 10, totalPages: 1 };
    api.get.mockImplementationOnce(async () => ({ data: { list, pagination } }));

    const result = await getAllReminders({ limit: 10, offset: 0 });

    expect(api.get).toHaveBeenCalledWith('/reminders', {
      params: { limit: 10, offset: 0 },
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ list, pagination });
  });

  it('rethrows the request error message', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getAllReminders({ limit: 10, offset: 0 })).rejects.toThrow('Network Error');
  });
});
