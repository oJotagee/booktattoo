import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createUserServiceApiMock } from '../../../../support/mocks';

const userServiceApi = createUserServiceApiMock();

mock.module('@/lib/user-service-api', () => ({ userServiceApi }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { forgotPassword } = await import('@/app/(public)/forgot-password/_actions/forgot-password');

describe('forgotPassword', () => {
  beforeEach(() => {
    userServiceApi.post.mockClear();
  });

  it('posts the email to the forgot-password endpoint', async () => {
    await forgotPassword({ email: 'john.doe@example.com' });

    expect(userServiceApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'john.doe@example.com',
    });
  });

  it('throws a friendly error when the request fails', async () => {
    userServiceApi.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    await expect(forgotPassword({ email: 'john.doe@example.com' })).rejects.toThrow(
      'Não foi possível enviar o e-mail. Tente novamente.',
    );
  });
});
