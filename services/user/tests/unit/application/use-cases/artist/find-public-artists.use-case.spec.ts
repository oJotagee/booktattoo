import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindPublicArtistsUseCase } from '@/application/use-cases/artist/find-public-artists.use-case';
import { UserStatus } from '@/domain/entities/user.entity';
import { buildUser } from '@tests/unit/support/builders';
import { createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('FindPublicArtistsUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let useCase: FindPublicArtistsUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    useCase = new FindPublicArtistsUseCase(users);
  });

  it('returns only the public fields of each artist', async () => {
    const user = buildUser({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+55 11 99999-9999',
      address: 'Rua Secreta, 123',
      bio: 'Fineline',
      role: 'Fineline',
      stripeCustomerId: 'cus_123',
      password: 'hashed-password',
      status: UserStatus.VACATION,
      times: ['09:00'],
    });
    users.findPublicArtists = async () => ({ items: [user], total: 1 });

    const result = await useCase.execute({});

    expect(result.list).toEqual([
      {
        id: 'user-1',
        name: 'John Doe',
        image: null,
        bio: 'Fineline',
        role: 'Fineline',
        status: UserStatus.VACATION,
        times: ['09:00'],
      },
    ]);
  });

  it('returns an empty page when there are no artists', async () => {
    const result = await useCase.execute({});

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findPublicArtists = mock(async () => ({ items: [], total: 0 }));
    users.findPublicArtists = findPublicArtists;

    await useCase.execute({});

    expect(findPublicArtists).toHaveBeenCalledWith({ limit: 10, offset: 0 });
  });

  it('forwards the given limit and offset', async () => {
    const findPublicArtists = mock(async () => ({ items: [], total: 0 }));
    users.findPublicArtists = findPublicArtists;

    await useCase.execute({ limit: 5, offset: 15 });

    expect(findPublicArtists).toHaveBeenCalledWith({ limit: 5, offset: 15 });
  });

  it('caps the limit at 50', async () => {
    const findPublicArtists = mock(async () => ({ items: [], total: 0 }));
    users.findPublicArtists = findPublicArtists;

    const result = await useCase.execute({ limit: 1000 });

    expect(findPublicArtists).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    expect(result.pagination.perPage).toBe(50);
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    users.findPublicArtists = async () => ({ items: [buildUser()], total: 23 });

    const result = await useCase.execute({ limit: 10, offset: 20 });

    expect(result.pagination).toEqual({ total: 23, page: 3, perPage: 10, totalPages: 3 });
  });
});
