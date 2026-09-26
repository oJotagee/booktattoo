import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { updateUserStatus } = await import('@/app/(panel)/dashboard/_actions/update-status');

describe('updateUserStatus', () => {
  beforeEach(() => {
    api.patch.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(updateUserStatus('ACTIVE')).rejects.toThrow('Usuário não autenticado');
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('sends the new status with the bearer token and revalidates the dashboard', async () => {
    const result = await updateUserStatus('VACATION');

    expect(api.patch).toHaveBeenCalledWith(
      '/users/me/status',
      { status: 'VACATION' },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/', 'layout');
    expect(result).toEqual({ status: 'VACATION' });
  });

  it('resolves with the current status when already in that status', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(409, { error: 'UserAlreadyInStatusError' });
    });

    const result = await updateUserStatus('ACTIVE');

    expect(result).toEqual({ status: 'ACTIVE' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rethrows any other error', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(500, { error: 'UnexpectedError' });
    });

    await expect(updateUserStatus('ACTIVE')).rejects.toBeDefined();
  });
});
