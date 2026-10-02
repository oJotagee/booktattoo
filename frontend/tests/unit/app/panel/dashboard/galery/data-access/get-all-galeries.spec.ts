import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));

const { getAllGaleries } = await import(
  '@/app/(panel)/dashboard/galery/_data-access/get-all-galeries'
);

describe('getAllGaleries', () => {
  const pagination = { total: 1, page: 1, perPage: 8, totalPages: 1 };

  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getAllGaleries({ limit: 8, offset: 0 })).rejects.toThrow(
      'Usuário não autenticado',
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it('requests the page without style when no filter is given', async () => {
    api.get.mockImplementationOnce(async () => ({ data: { list: [], pagination } }));

    const result = await getAllGaleries({ limit: 8, offset: 8 });

    expect(api.get).toHaveBeenCalledWith('/galeries', {
      params: { limit: 8, offset: 8 },
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ list: [], pagination });
  });

  it('forwards the style filter', async () => {
    api.get.mockImplementationOnce(async () => ({ data: { list: [], pagination } }));

    await getAllGaleries({ limit: 8, offset: 0, style: 'BLACKWORK' });

    expect(api.get).toHaveBeenCalledWith('/galeries', {
      params: { limit: 8, offset: 0, style: 'BLACKWORK' },
      headers: { Authorization: 'Bearer access-token' },
    });
  });

  it('rethrows the request error message', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getAllGaleries({ limit: 8, offset: 0 })).rejects.toThrow('Network Error');
  });
});
