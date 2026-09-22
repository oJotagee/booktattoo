import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateUserStatusUseCase } from '@/application/use-cases/user/update-user-status.use-case';
import { UserStatus } from '@/domain/entities/user.entity';
import { UserAlreadyInStatusError, UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import { createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('UpdateUserStatusUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let useCase: UpdateUserStatusUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    useCase = new UpdateUserStatusUseCase(users);
  });

  it('activates a user', async () => {
    const user = buildUser({ status: UserStatus.INACTIVE });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: user.id, status: UserStatus.ACTIVE });

    expect(result.status).toBe(UserStatus.ACTIVE);
  });

  it('deactivates a user', async () => {
    const user = buildUser({ status: UserStatus.ACTIVE });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: user.id, status: UserStatus.INACTIVE });

    expect(result.status).toBe(UserStatus.INACTIVE);
  });

  it('sets a user on vacation', async () => {
    const user = buildUser({ status: UserStatus.ACTIVE });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: user.id, status: UserStatus.VACATION });

    expect(result.status).toBe(UserStatus.VACATION);
  });

  it('throws UserAlreadyInStatusError when the user is already in the target status', async () => {
    const user = buildUser({ status: UserStatus.ACTIVE });
    users.findById = async () => user;

    await expect(
      useCase.execute({ userId: user.id, status: UserStatus.ACTIVE }),
    ).rejects.toThrow(UserAlreadyInStatusError);
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    users.findById = async () => null;

    await expect(
      useCase.execute({ userId: 'missing-user', status: UserStatus.ACTIVE }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
