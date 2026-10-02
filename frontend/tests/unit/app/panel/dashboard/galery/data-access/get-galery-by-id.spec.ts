import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { getGaleryById } = await import(
  '@/app/(panel)/dashboard/galery/_data-access/get-galery-by-id'
);

describe('getGaleryById', () => {
  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getGaleryById('galery-1')).rejects.toThrow('Usuário não autenticado');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('returns the galery', async () => {
    const galery = { id: 'galery-1', title: 'Rosa Tradicional' };
    api.get.mockImplementationOnce(async () => ({ data: galery }));

    const result = await getGaleryById('galery-1');

    expect(api.get).toHaveBeenCalledWith('/galeries/galery-1', {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual(galery as never);
  });

  it.each([403, 404])('returns null when the API responds %i', async (status) => {
    api.get.mockImplementationOnce(async () => {
      throw createAxiosError(status, { message: 'Not found' });
    });

    expect(await getGaleryById('galery-1')).toBeNull();
  });

  it('rethrows other errors', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getGaleryById('galery-1')).rejects.toThrow('Network Error');
  });
});
