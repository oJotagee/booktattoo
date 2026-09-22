import { beforeEach, describe, expect, it } from 'bun:test';

import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { InvalidCredentialsError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import {
  createRefreshTokenRepositoryMock,
  createSessionTokenIssuerMock,
  createTokenGeneratorMock,
  createUserRepositoryMock,
  createPasswordHasherMock,
} from '@tests/unit/support/mocks';

describe('LoginUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let passwordHasher: ReturnType<typeof createPasswordHasherMock>;
  let tokenGenerator: ReturnType<typeof createTokenGeneratorMock>;
  let sessionTokenIssuer: ReturnType<typeof createSessionTokenIssuerMock>;
  let refreshTokens: ReturnType<typeof createRefreshTokenRepositoryMock>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    tokenGenerator = createTokenGeneratorMock();
    sessionTokenIssuer = createSessionTokenIssuerMock();
    refreshTokens = createRefreshTokenRepositoryMock();
    useCase = new LoginUseCase(users, passwordHasher, tokenGenerator, sessionTokenIssuer, refreshTokens);
  });

  it('returns tokens and user data on successful login', async () => {
    const user = buildUser({ email: 'john.doe@example.com', password: 'hashed-password' });
    users.findByEmail = async () => user;
    passwordHasher.compare = async () => true;

    const result = await useCase.execute({ email: 'john.doe@example.com', password: 'plain-password' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('opaque-refresh-token');
    expect(result.user).toMatchObject({ id: user.id, email: user.email.toString() });
    expect(refreshTokens.create).toHaveBeenCalledTimes(1);
  });

  it('throws InvalidCredentialsError when the user does not exist', async () => {
    users.findByEmail = async () => null;

    await expect(
      useCase.execute({ email: 'missing@example.com', password: 'plain-password' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when the user has no password set (oauth-only account)', async () => {
    const user = buildUser({ email: 'john.doe@example.com', password: null });
    users.findByEmail = async () => user;

    await expect(
      useCase.execute({ email: 'john.doe@example.com', password: 'plain-password' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when the password does not match', async () => {
    const user = buildUser({ email: 'john.doe@example.com', password: 'hashed-password' });
    users.findByEmail = async () => user;
    passwordHasher.compare = async () => false;

    await expect(
      useCase.execute({ email: 'john.doe@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
