import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createCatalogServiceApiMock } from '../../../../../support/mocks';

const catalogServiceApi = createCatalogServiceApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/catalog-service-api', () => ({ catalogServiceApi }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));

const { getAllServices } = await import(
  '@/app/(panel)/dashboard/services/_data_access/get-all-services'
);

describe('getAllServices', () => {
  beforeEach(() => {
    catalogServiceApi.get.mockClear();
    getAccessToken.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getAllServices({ limit: 5, offset: 0 })).rejects.toThrow(
      'Usuário não autenticado',
    );
    expect(catalogServiceApi.get).not.toHaveBeenCalled();
  });

  it('requests the page with limit/offset and returns the list with pagination', async () => {
    const list = [
      {
        id: 'service-1',
        name: 'Cover-up',
        duration: 180,
        depositAmount: 55000,
        status: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ];
    const pagination = { total: 6, page: 2, perPage: 5, totalPages: 2 };
    catalogServiceApi.get.mockImplementationOnce(async () => ({ data: { list, pagination } }));

    const result = await getAllServices({ limit: 5, offset: 5 });

    expect(catalogServiceApi.get).toHaveBeenCalledWith('/services', {
      params: { limit: 5, offset: 5 },
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ list, pagination });
  });

  it('rethrows the request error message', async () => {
    catalogServiceApi.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getAllServices({ limit: 5, offset: 0 })).rejects.toThrow('Network Error');
  });
});
