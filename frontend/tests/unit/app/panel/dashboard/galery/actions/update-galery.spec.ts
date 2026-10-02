import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { updateGalery } = await import('@/app/(panel)/dashboard/galery/_actions/update-galery');

describe('updateGalery', () => {
  const input = {
    id: 'galery-1',
    title: 'Cobra Japonesa',
    price: 42000,
    style: 'JAPONES' as const,
  };

  beforeEach(() => {
    api.put.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateGalery(input);

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('updates the galery without sending the id in the body', async () => {
    const output = { id: 'galery-1', title: 'Cobra Japonesa' };
    api.put.mockImplementationOnce(async () => ({ data: output }));

    const result = await updateGalery(input);

    expect(api.put).toHaveBeenCalledWith(
      '/galeries/galery-1',
      { title: 'Cobra Japonesa', price: 42000, style: 'JAPONES' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/galery');
    expect(result).toEqual({ data: output } as never);
  });

  it('returns the API error message when the request fails with one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(404, { message: 'Galery not found' });
    });

    const result = await updateGalery(input);

    expect(result).toEqual({ error: 'Galery not found' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateGalery(input);

    expect(result).toEqual({ error: 'Não foi possível atualizar o flash' });
  });
});
