import { beforeEach, describe, expect, it } from 'bun:test';

import { FindPublicArtistByIdUseCase } from '@/application/use-cases/artist/find-public-artist-by-id.use-case';
import { UserStatus } from '@/domain/entities/user.entity';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import { createCacheMock, createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('FindPublicArtistByIdUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let useCase: FindPublicArtistByIdUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    useCase = new FindPublicArtistByIdUseCase(users, createCacheMock());
  });

  it('returns only the public fields of the artist', async () => {
    users.findById = async () =>
      buildUser({
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+55 11 99999-9999',
        bio: 'Fineline',
        role: 'Fineline',
        status: UserStatus.ACTIVE,
        times: ['09:00', '09:30'],
      });

    const result = await useCase.execute({ id: 'user-1' });

    expect(result).toEqual({
      id: 'user-1',
      name: 'John Doe',
      image: null,
      bio: 'Fineline',
      role: 'Fineline',
      status: UserStatus.ACTIVE,
      times: ['09:00', '09:30'],
      paymentsEnabled: false,
    });
  });

  it('throws when the artist does not exist', async () => {
    users.findById = async () => null;

    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('hides inactive artists', async () => {
    users.findById = async () => buildUser({ id: 'user-1', status: UserStatus.INACTIVE });

    await expect(useCase.execute({ id: 'user-1' })).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
