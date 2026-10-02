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

const { updateGaleryAvailability } = await import(
  '@/app/(panel)/dashboard/galery/_actions/update-galery-availability'
);

describe('updateGaleryAvailability', () => {
  beforeEach(() => {
    api.patch.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateGaleryAvailability({ id: 'galery-1', available: false });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('patches the availability and revalidates the galery page', async () => {
    const result = await updateGaleryAvailability({ id: 'galery-1', available: false });

    expect(api.patch).toHaveBeenCalledWith(
      '/galeries/galery-1/availability',
      { available: false },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/galery');
    expect(result).toEqual({ data: 'Disponibilidade atualizada com sucesso' });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(400, { message: 'Galery already unavailable' });
    });

    const result = await updateGaleryAvailability({ id: 'galery-1', available: false });

    expect(result).toEqual({ error: 'Galery already unavailable' });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateGaleryAvailability({ id: 'galery-1', available: true });

    expect(result).toEqual({ error: 'Não foi possível atualizar a disponibilidade do flash' });
  });
});
