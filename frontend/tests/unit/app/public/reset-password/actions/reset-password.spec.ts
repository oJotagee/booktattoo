import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { resetPassword } = await import(
  '@/app/(public)/reset-password/[token]/_actions/reset-password'
);

describe('resetPassword', () => {
  beforeEach(() => {
    api.post.mockClear();
  });

  it('posts the token and new password to the reset-password endpoint', async () => {
    await resetPassword({ token: 'opaque-token', newPassword: 'NewPassword123!' });

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'opaque-token',
      newPassword: 'NewPassword123!',
    });
  });

  it('returns an invalid-link error for a 410 response', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(410);
    });

    expect(await resetPassword({ token: 'expired-token', newPassword: 'NewPassword123!' })).toEqual({
      error: 'Link inválido ou expirado. Solicite um novo.',
    });
  });

  it('returns an invalid-link error for a 404 response', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(404);
    });

    expect(await resetPassword({ token: 'unknown-token', newPassword: 'NewPassword123!' })).toEqual({
      error: 'Link inválido ou expirado. Solicite um novo.',
    });
  });

  it('returns a generic error for any other failure', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    expect(await resetPassword({ token: 'opaque-token', newPassword: 'NewPassword123!' })).toEqual({
      error: 'Não foi possível redefinir sua senha. Tente novamente.',
    });
  });
});
