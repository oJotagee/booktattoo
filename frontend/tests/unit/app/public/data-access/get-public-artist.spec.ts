import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createApiMock, createAxiosError } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { getPublicArtist } = await import('@/app/(public)/_data-access/get-public-artist');

describe('getPublicArtist', () => {
  beforeEach(() => {
    api.get.mockClear();
  });

  it('requests the public artist by id', async () => {
    api.get.mockImplementationOnce(async () => ({ data: { id: 'user-1', name: 'Ana Lima' } }));

    const artist = await getPublicArtist('5bd851d8-f523-4b0d-9a3b-099273ea8932');

    expect(api.get).toHaveBeenCalledWith('/public/artists/5bd851d8-f523-4b0d-9a3b-099273ea8932');
    expect(artist).toEqual({ id: 'user-1', name: 'Ana Lima' } as never);
  });

  it('returns null for 404', async () => {
    api.get.mockImplementationOnce(async () => {
      throw createAxiosError(404);
    });

    expect(await getPublicArtist('missing-id')).toBeNull();
  });

  it('ignores file-like paths without calling the API', async () => {
    for (const id of ['site.webmanifest', 'favicon.ico', 'robots.txt']) {
      expect(await getPublicArtist(id)).toBeNull();
    }

    expect(api.get).not.toHaveBeenCalled();
  });
});
