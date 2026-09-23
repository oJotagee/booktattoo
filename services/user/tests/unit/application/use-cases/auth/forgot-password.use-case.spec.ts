import { beforeEach, describe, expect, it } from 'bun:test';

import { ForgotPasswordUseCase } from '@/application/use-cases/auth/forgot-password.use-case';
import { buildUser } from '@tests/unit/support/builders';
import {
  createMailPortMock,
  createPasswordResetTokenRepositoryMock,
  createTokenGeneratorMock,
  createUserRepositoryMock,
} from '@tests/unit/support/mocks';

describe('ForgotPasswordUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let tokenGenerator: ReturnType<typeof createTokenGeneratorMock>;
  let passwordResetTokens: ReturnType<typeof createPasswordResetTokenRepositoryMock>;
  let mail: ReturnType<typeof createMailPortMock>;
  let useCase: ForgotPasswordUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    tokenGenerator = createTokenGeneratorMock();
    passwordResetTokens = createPasswordResetTokenRepositoryMock();
    mail = createMailPortMock();
    useCase = new ForgotPasswordUseCase(users, tokenGenerator, passwordResetTokens, mail);
  });

  it('creates a reset token and sends an email when the user exists', async () => {
    const user = buildUser({ id: 'user-1', email: 'john.doe@example.com' });
    users.findByEmail = async () => user;

    await useCase.execute({ email: 'john.doe@example.com' });

    expect(passwordResetTokens.create).toHaveBeenCalledTimes(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
    expect(mail.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'john.doe@example.com' }));
  });

  it('does nothing when the user does not exist', async () => {
    users.findByEmail = async () => null;

    await useCase.execute({ email: 'unknown@example.com' });

    expect(passwordResetTokens.create).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });
});
