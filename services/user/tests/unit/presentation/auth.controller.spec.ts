import { describe, expect, it, mock } from 'bun:test';

import { AuthController } from '@/presentation/controllers/auth.controller';

function buildController() {
  const registerUser = { execute: mock(async () => ({ id: 'user-1' })) };
  const login = { execute: mock(async () => ({ accessToken: 'access-token' })) };
  const oauthUpsert = { execute: mock(async () => ({ accessToken: 'access-token' })) };
  const refreshToken = { execute: mock(async () => ({ accessToken: 'new-access-token' })) };

  const controller = new AuthController(
    registerUser as never,
    login as never,
    oauthUpsert as never,
    refreshToken as never,
  );

  return { controller, registerUser, login, oauthUpsert, refreshToken };
}

describe('AuthController', () => {
  it('delegates registration to RegisterUserUseCase', async () => {
    const { controller, registerUser } = buildController();
    const body = { name: 'John Doe', email: 'john.doe@example.com', password: 'secret123' };

    await controller.register(body);

    expect(registerUser.execute).toHaveBeenCalledWith(body);
  });

  it('delegates login to LoginUseCase', async () => {
    const { controller, login } = buildController();
    const body = { email: 'john.doe@example.com', password: 'secret123' };

    await controller.signIn(body);

    expect(login.execute).toHaveBeenCalledWith(body);
  });

  it('delegates oauth upsert to OAuthUpsertUseCase', async () => {
    const { controller, oauthUpsert } = buildController();
    const body = {
      provider: 'google' as const,
      providerAccountId: 'google-account-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      image: null,
    };

    await controller.upsertOAuthAccount(body);

    expect(oauthUpsert.execute).toHaveBeenCalledWith(body);
  });

  it('delegates token refresh to RefreshTokenUseCase', async () => {
    const { controller, refreshToken } = buildController();
    const body = { refreshToken: 'opaque-refresh-token' };

    await controller.refresh(body);

    expect(refreshToken.execute).toHaveBeenCalledWith(body);
  });
});
