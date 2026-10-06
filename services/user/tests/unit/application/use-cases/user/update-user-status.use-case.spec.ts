import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { UpdateUserStatusUseCase } from '@/application/use-cases/user/update-user-status.use-case';
import { UserStatus } from '@/domain/entities/user.entity';
import { UserAlreadyInStatusError, UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import {
  createCacheMock,
  createUserRepositoryMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

describe('UpdateUserStatusUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: UpdateUserStatusUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    cache = createCacheMock();
    publisher = createEventPublisherMock();
    useCase = new UpdateUserStatusUseCase(users, cache, publisher);
  });

  it('activates a user', async () => {
    const user = buildUser({ status: UserStatus.INACTIVE });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: user.id, status: UserStatus.ACTIVE });

    expect(result.status).toBe(UserStatus.ACTIVE);
    expect(cache.invalidate).toHaveBeenCalledWith('user:public:artists');
    expect(publisher.publish).toHaveBeenCalledTimes(1);
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

    await expect(useCase.execute({ userId: user.id, status: UserStatus.ACTIVE })).rejects.toThrow(
      UserAlreadyInStatusError,
    );
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    users.findById = async () => null;

    await expect(
      useCase.execute({ userId: 'missing-user', status: UserStatus.ACTIVE }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('publishes user.profile.updated with the new public profile', async () => {
    const user = buildUser({ id: 'user-1', name: 'John Doe', status: UserStatus.ACTIVE });
    users.findById = async () => user;

    await useCase.execute({ userId: 'user-1', status: UserStatus.INACTIVE });

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'user.profile.updated',
        correlationId: 'user-1',
        payload: { userId: 'user-1', name: 'John Doe', image: null, status: UserStatus.INACTIVE },
      }),
    );
  });

  it('still updates the status when the event cannot be published', async () => {
    const user = buildUser({ status: UserStatus.ACTIVE });
    users.findById = async () => user;
    publisher.publish = mock(async () => {
      throw new Error('RabbitMQ indisponível no momento.');
    });

    const result = await useCase.execute({ userId: user.id, status: UserStatus.VACATION });

    expect(result.status).toBe(UserStatus.VACATION);
    expect(users.update).toHaveBeenCalledTimes(1);
  });
});
