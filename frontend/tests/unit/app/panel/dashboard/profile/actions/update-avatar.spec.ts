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

const { updateAvatar } = await import('@/app/(panel)/dashboard/profile/_actions/update-avatar');

describe('updateAvatar', () => {
  beforeEach(() => {
    api.put.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateAvatar(new FormData());

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('sends the form data with the bearer token and revalidates the dashboard', async () => {
    const output = {
      id: 'user-1',
      image: 'https://cdn.example.com/avatar.png',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    api.put.mockImplementationOnce(async () => ({ data: output }));
    const formData = new FormData();

    const result = await updateAvatar(formData);

    expect(api.put).toHaveBeenCalledWith('/users/me/avatar', formData, {
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'multipart/form-data',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/', 'layout');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(400, { message: 'Arquivo inválido' });
    });

    const result = await updateAvatar(new FormData());

    expect(result).toEqual({ error: 'Arquivo inválido' });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateAvatar(new FormData());

    expect(result).toEqual({ error: 'Não foi possível atualizar a foto de perfil' });
  });
});
