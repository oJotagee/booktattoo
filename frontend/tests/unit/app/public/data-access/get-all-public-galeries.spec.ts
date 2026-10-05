import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));

const { getAllPublicGaleries } = await import(
  '@/app/(public)/_data-access/get-all-public-galeries'
);

describe('getAllPublicGaleries', () => {
  beforeEach(() => {
    api.get.mockClear();
  });

  it('requests the public page with limit/offset, without auth, and returns the list with pagination', async () => {
    const list = [
      {
        id: 'galery-1',
        title: 'Rosa Tradicional',
        imageUrl: 'https://bucket.s3.us-east-1.amazonaws.com/rosa.jpg',
        size: '6 cm',
        price: 28000,
        style: 'TRADICIONAL' as const,
        userId: 'user-1',
        serviceId: 'service-1',
      },
    ];
    const pagination = { total: 1, page: 1, perPage: 10, totalPages: 1 };
    api.get.mockImplementationOnce(async () => ({ data: { list, pagination } }));

    const result = await getAllPublicGaleries({ limit: 10, offset: 0 });

    expect(api.get).toHaveBeenCalledWith('/public/galeries', { params: { limit: 10, offset: 0 } });
    expect(result).toEqual({ list, pagination });
  });

  it('sends the style and userId filters when provided', async () => {
    api.get.mockImplementationOnce(async () => ({
      data: { list: [], pagination: { total: 0, page: 2, perPage: 10, totalPages: 0 } },
    }));

    await getAllPublicGaleries({ limit: 10, offset: 10, style: 'JAPONES', userId: 'user-1' });

    expect(api.get).toHaveBeenCalledWith('/public/galeries', {
      params: { limit: 10, offset: 10, style: 'JAPONES', userId: 'user-1' },
    });
  });

  it('rethrows the request error message', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getAllPublicGaleries({ limit: 10, offset: 0 })).rejects.toThrow('Network Error');
  });
});
