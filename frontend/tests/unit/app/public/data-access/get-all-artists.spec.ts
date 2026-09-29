import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));

const { getAllArtists } = await import('@/app/(public)/_data-access/get-all-artists');

describe('getAllArtists', () => {
  beforeEach(() => {
    api.get.mockClear();
  });

  it('requests the public page with limit/offset, without auth, and returns the list with pagination', async () => {
    const list = [
      {
        id: 'user-1',
        name: 'Ana Lima',
        image: null,
        bio: null,
        role: 'Fineline',
        status: 'ACTIVE',
        times: ['09:00'],
      },
    ];
    const pagination = { total: 1, page: 1, perPage: 4, totalPages: 1 };
    api.get.mockImplementationOnce(async () => ({ data: { list, pagination } }));

    const result = await getAllArtists({ limit: 4, offset: 0 });

    expect(api.get).toHaveBeenCalledWith('/public/artists', { params: { limit: 4, offset: 0 } });
    expect(result).toEqual({ list, pagination });
  });

  it('rethrows the request error message', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getAllArtists({ limit: 4, offset: 0 })).rejects.toThrow('Network Error');
  });
});
