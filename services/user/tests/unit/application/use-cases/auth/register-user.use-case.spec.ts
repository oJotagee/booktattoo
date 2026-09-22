import { beforeEach, describe, expect, it } from 'bun:test';

import { RegisterUserUseCase } from '@/application/use-cases/auth/register-user.use-case';
import { UserAlreadyExistsError } from '@/domain/errors/user.error';
import { InvalidEmailError } from '@/domain/errors/email.error';
import { buildUser } from '@tests/unit/support/builders';
import { createPasswordHasherMock, createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('RegisterUserUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let passwordHasher: ReturnType<typeof createPasswordHasherMock>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    useCase = new RegisterUserUseCase(users, passwordHasher);
  });

  it('creates a new user with a hashed password when the email is not in use', async () => {
    users.findByEmail = async () => null;
    users.create = async () => undefined;

    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'plain-password',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('plain-password');
    expect(result).toMatchObject({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    expect(result.id).toBeString();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('throws UserAlreadyExistsError when the email is already registered', async () => {
    users.findByEmail = async () => buildUser({ email: 'john.doe@example.com' });

    await expect(
      useCase.execute({ name: 'John Doe', email: 'john.doe@example.com', password: 'secret123' }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('throws InvalidEmailError when the email is malformed', async () => {
    await expect(
      useCase.execute({ name: 'John Doe', email: 'not-an-email', password: 'secret123' }),
    ).rejects.toThrow(InvalidEmailError);
  });
});
