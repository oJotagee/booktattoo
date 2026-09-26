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

const { updateProfile } = await import('@/app/(panel)/dashboard/profile/_actions/update-profile');

describe('updateProfile', () => {
  beforeEach(() => {
    api.put.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateProfile({ name: 'John Doe' });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('sends the update with the bearer token and revalidates the dashboard', async () => {
    const output = {
      id: 'user-1',
      name: 'John Doe',
      image: null,
      address: null,
      phone: null,
      bio: null,
      role: null,
      times: [],
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    api.put.mockImplementationOnce(async () => ({ data: output }));

    const result = await updateProfile({ name: 'John Doe' });

    expect(api.put).toHaveBeenCalledWith(
      '/users/me',
      { name: 'John Doe' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/', 'layout');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(400, { message: 'Nome inválido' });
    });

    const result = await updateProfile({ name: '' });

    expect(result).toEqual({ error: 'Nome inválido' });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateProfile({ name: 'John Doe' });

    expect(result).toEqual({ error: 'Não foi possível atualizar o perfil' });
  });
});
