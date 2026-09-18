import { beforeEach, describe, expect, it } from 'bun:test';

import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';
import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import {
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  RefreshTokenRevokedError,
} from '@/domain/errors/refresh-token.error';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import {
  createRefreshTokenRepositoryMock,
  createSessionTokenIssuerMock,
  createTokenGeneratorMock,
  createUserRepositoryMock,
} from '@tests/unit/support/mocks';

function buildRefreshToken(overrides: Partial<{ userId: string; expiresAt: Date }> = {}) {
  return RefreshTokenEntity.create({
    id: 'refresh-token-1',
    userId: overrides.userId ?? 'user-1',
    tokenHash: 'hashed:opaque-refresh-token',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
  });
}

describe('RefreshTokenUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let tokenGenerator: ReturnType<typeof createTokenGeneratorMock>;
  let sessionTokenIssuer: ReturnType<typeof createSessionTokenIssuerMock>;
  let refreshTokens: ReturnType<typeof createRefreshTokenRepositoryMock>;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    tokenGenerator = createTokenGeneratorMock();
    sessionTokenIssuer = createSessionTokenIssuerMock();
    refreshTokens = createRefreshTokenRepositoryMock();
    useCase = new RefreshTokenUseCase(users, tokenGenerator, sessionTokenIssuer, refreshTokens);
  });

  it('rotates the refresh token and issues a new access token', async () => {
    const existingToken = buildRefreshToken({ userId: 'user-1' });
    const user = buildUser({ id: 'user-1' });
    refreshTokens.findByTokenHash = async () => existingToken;
    users.findById = async () => user;

    const result = await useCase.execute({ refreshToken: 'opaque-refresh-token' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('opaque-refresh-token');
    expect(refreshTokens.update).toHaveBeenCalledTimes(1);
    expect(refreshTokens.create).toHaveBeenCalledTimes(1);
  });

  it('throws RefreshTokenNotFoundError when the token hash is unknown', async () => {
    refreshTokens.findByTokenHash = async () => null;

    await expect(useCase.execute({ refreshToken: 'unknown-token' })).rejects.toThrow(
      RefreshTokenNotFoundError,
    );
  });

  it('throws RefreshTokenExpiredError when the token is expired', async () => {
    const expiredToken = buildRefreshToken({ expiresAt: new Date(Date.now() - 1000) });
    refreshTokens.findByTokenHash = async () => expiredToken;

    await expect(useCase.execute({ refreshToken: 'opaque-refresh-token' })).rejects.toThrow(
      RefreshTokenExpiredError,
    );
  });

  it('throws RefreshTokenRevokedError when the token was already revoked', async () => {
    const revokedToken = buildRefreshToken().revoke();
    refreshTokens.findByTokenHash = async () => revokedToken;

    await expect(useCase.execute({ refreshToken: 'opaque-refresh-token' })).rejects.toThrow(
      RefreshTokenRevokedError,
    );
  });

  it('throws UserNotFoundError when the token owner no longer exists', async () => {
    const existingToken = buildRefreshToken({ userId: 'missing-user' });
    refreshTokens.findByTokenHash = async () => existingToken;
    users.findById = async () => null;

    await expect(useCase.execute({ refreshToken: 'opaque-refresh-token' })).rejects.toThrow(
      UserNotFoundError,
    );
  });
});
