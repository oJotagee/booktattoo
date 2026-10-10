import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { registerUser } = await import('@/app/(public)/login/_actions/register');

describe('registerUser', () => {
  beforeEach(() => {
    api.post.mockClear();
  });

  it('posts the registration payload to the register endpoint', async () => {
    const input = { name: 'John Doe', email: 'john.doe@example.com', password: 'Secret123!' };

    await registerUser(input);

    expect(api.post).toHaveBeenCalledWith('/auth/register', input);
  });

  it('returns a duplicate-account error for a 409 response', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409);
    });

    expect(await registerUser({ name: 'John Doe', email: 'john.doe@example.com', password: 'Secret123!' })).toEqual({
      error: 'Já existe uma conta com este e-mail.',
    });
  });

  it('returns a generic error for any other failure', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    expect(await registerUser({ name: 'John Doe', email: 'john.doe@example.com', password: 'Secret123!' })).toEqual({
      error: 'Não foi possível criar sua conta. Tente novamente.',
    });
  });
});
