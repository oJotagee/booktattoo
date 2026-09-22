import { beforeEach, describe, expect, it } from 'bun:test';

import { FindUserByIdUseCase } from '@/application/use-cases/user/find-user-by-id.use-case';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import { createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('FindUserByIdUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let useCase: FindUserByIdUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    useCase = new FindUserByIdUseCase(users);
  });

  it('returns the user data when the user exists', async () => {
    const user = buildUser({ id: 'user-1', name: 'John Doe', email: 'john.doe@example.com' });
    users.findById = async () => user;

    const result = await useCase.execute({ id: 'user-1' });

    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      image: user.image,
      address: user.address,
      phone: user.phone,
      bio: user.bio,
      role: user.role,
      status: user.status,
      times: user.times,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  it('includes the role field when the user has one set', async () => {
    const user = buildUser({ id: 'user-1', role: 'Tradicional & Neo' });
    users.findById = async () => user;

    const result = await useCase.execute({ id: 'user-1' });

    expect(result.role).toBe('Tradicional & Neo');
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    users.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-user' })).rejects.toThrow(UserNotFoundError);
  });
});
