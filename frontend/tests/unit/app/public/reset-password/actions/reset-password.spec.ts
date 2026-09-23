import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createUserServiceApiMock } from '../../../../support/mocks';

const userServiceApi = createUserServiceApiMock();

mock.module('@/lib/user-service-api', () => ({ userServiceApi }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { resetPassword } = await import(
  '@/app/(public)/reset-password/[token]/_actions/reset-password'
);

describe('resetPassword', () => {
  beforeEach(() => {
    userServiceApi.post.mockClear();
  });

  it('posts the token and new password to the reset-password endpoint', async () => {
    await resetPassword({ token: 'opaque-token', newPassword: 'NewPassword123!' });

    expect(userServiceApi.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'opaque-token',
      newPassword: 'NewPassword123!',
    });
  });

  it('throws an invalid-link error for a 401 response', async () => {
    userServiceApi.post.mockImplementationOnce(async () => {
      throw createAxiosError(401);
    });

    await expect(
      resetPassword({ token: 'expired-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow('Link inválido ou expirado. Solicite um novo.');
  });

  it('throws an invalid-link error for a 404 response', async () => {
    userServiceApi.post.mockImplementationOnce(async () => {
      throw createAxiosError(404);
    });

    await expect(
      resetPassword({ token: 'unknown-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow('Link inválido ou expirado. Solicite um novo.');
  });

  it('throws a generic error for any other failure', async () => {
    userServiceApi.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    await expect(
      resetPassword({ token: 'opaque-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow('Não foi possível redefinir sua senha. Tente novamente.');
  });
});
