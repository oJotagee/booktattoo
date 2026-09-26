import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { forgotPassword } = await import('@/app/(public)/forgot-password/_actions/forgot-password');

describe('forgotPassword', () => {
  beforeEach(() => {
    api.post.mockClear();
  });

  it('posts the email to the forgot-password endpoint', async () => {
    await forgotPassword({ email: 'john.doe@example.com' });

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'john.doe@example.com',
    });
  });

  it('throws a friendly error when the request fails', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    await expect(forgotPassword({ email: 'john.doe@example.com' })).rejects.toThrow(
      'Não foi possível enviar o e-mail. Tente novamente.',
    );
  });
});
