import { describe, expect, it, mock } from 'bun:test';

import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { UsersController } from '@/presentation/controllers/users.controller';

function buildController() {
  const registerUser = { execute: mock(async () => ({ id: 'user-1' })) };
  const login = { execute: mock(async () => ({ accessToken: 'access-token' })) };
  const oauthUpsert = { execute: mock(async () => ({ accessToken: 'access-token' })) };
  const refreshToken = { execute: mock(async () => ({ accessToken: 'new-access-token' })) };
  const findUserById = { execute: mock(async () => ({ id: 'user-1' })) };
  const updateUserContactInfo = { execute: mock(async () => ({ id: 'user-1' })) };
  const updateUserStatus = { execute: mock(async () => ({ id: 'user-1', status: 'ACTIVE' })) };

  const controller = new UsersController(
    registerUser as never,
    login as never,
    oauthUpsert as never,
    refreshToken as never,
    findUserById as never,
    updateUserContactInfo as never,
    updateUserStatus as never,
  );

  return {
    controller,
    registerUser,
    login,
    oauthUpsert,
    refreshToken,
    findUserById,
    updateUserContactInfo,
    updateUserStatus,
  };
}

const payload: PayloadSession = { sub: 'user-1', email: 'john.doe@example.com' };

describe('UsersController', () => {
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

  it('delegates fetching the current user to FindUserByIdUseCase', async () => {
    const { controller, findUserById } = buildController();

    await controller.me(payload);

    expect(findUserById.execute).toHaveBeenCalledWith({ id: payload.sub });
  });

  it('delegates updating contact info to UpdateUserContactInfoUseCase', async () => {
    const { controller, updateUserContactInfo } = buildController();
    const body = { name: 'Jane Doe' };

    await controller.updateMe(payload, body);

    expect(updateUserContactInfo.execute).toHaveBeenCalledWith({ userId: payload.sub, ...body });
  });

  it('delegates updating the status to UpdateUserStatusUseCase', async () => {
    const { controller, updateUserStatus } = buildController();
    const body = { status: 'INACTIVE' as const };

    await controller.updateMyStatus(payload, body);

    expect(updateUserStatus.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      status: body.status,
    });
  });
});
