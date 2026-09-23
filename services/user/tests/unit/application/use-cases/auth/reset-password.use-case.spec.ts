import { beforeEach, describe, expect, it } from 'bun:test';

import { ResetPasswordUseCase } from '@/application/use-cases/auth/reset-password.use-case';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import {
  PasswordResetTokenExpiredError,
  PasswordResetTokenNotFoundError,
  PasswordResetTokenUsedError,
} from '@/domain/errors/password-reset-token.error';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import {
  createPasswordHasherMock,
  createPasswordResetTokenRepositoryMock,
  createTokenGeneratorMock,
  createUserRepositoryMock,
} from '@tests/unit/support/mocks';

function buildPasswordResetToken(overrides: Partial<{ userId: string; expiresAt: Date }> = {}) {
  return PasswordResetTokenEntity.create({
    id: 'reset-token-1',
    userId: overrides.userId ?? 'user-1',
    tokenHash: 'hashed:opaque-reset-token',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
  });
}

describe('ResetPasswordUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let passwordHasher: ReturnType<typeof createPasswordHasherMock>;
  let tokenGenerator: ReturnType<typeof createTokenGeneratorMock>;
  let passwordResetTokens: ReturnType<typeof createPasswordResetTokenRepositoryMock>;
  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    tokenGenerator = createTokenGeneratorMock();
    passwordResetTokens = createPasswordResetTokenRepositoryMock();
    useCase = new ResetPasswordUseCase(users, passwordHasher, tokenGenerator, passwordResetTokens);
  });

  it('updates the user password and marks the token as used', async () => {
    const existingToken = buildPasswordResetToken({ userId: 'user-1' });
    const user = buildUser({ id: 'user-1' });
    passwordResetTokens.findByTokenHash = async () => existingToken;
    users.findById = async () => user;

    await useCase.execute({ token: 'opaque-reset-token', newPassword: 'NewPassword123!' });

    expect(users.update).toHaveBeenCalledTimes(1);
    expect(passwordResetTokens.update).toHaveBeenCalledTimes(1);
  });

  it('throws PasswordResetTokenNotFoundError when the token hash is unknown', async () => {
    passwordResetTokens.findByTokenHash = async () => null;

    await expect(
      useCase.execute({ token: 'unknown-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(PasswordResetTokenNotFoundError);
  });

  it('throws PasswordResetTokenExpiredError when the token is expired', async () => {
    const expiredToken = buildPasswordResetToken({ expiresAt: new Date(Date.now() - 1000) });
    passwordResetTokens.findByTokenHash = async () => expiredToken;

    await expect(
      useCase.execute({ token: 'opaque-reset-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(PasswordResetTokenExpiredError);
  });

  it('throws PasswordResetTokenUsedError when the token was already used', async () => {
    const usedToken = buildPasswordResetToken().markUsed();
    passwordResetTokens.findByTokenHash = async () => usedToken;

    await expect(
      useCase.execute({ token: 'opaque-reset-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(PasswordResetTokenUsedError);
  });

  it('throws UserNotFoundError when the token owner no longer exists', async () => {
    const existingToken = buildPasswordResetToken({ userId: 'missing-user' });
    passwordResetTokens.findByTokenHash = async () => existingToken;
    users.findById = async () => null;

    await expect(
      useCase.execute({ token: 'opaque-reset-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
