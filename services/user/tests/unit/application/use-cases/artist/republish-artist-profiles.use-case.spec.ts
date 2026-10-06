import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { RepublishArtistProfilesUseCase } from '@/application/use-cases/artist/republish-artist-profiles.use-case';
import { buildUser } from '@tests/unit/support/builders';
import { createEventPublisherMock, createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('RepublishArtistProfilesUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: RepublishArtistProfilesUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    publisher = createEventPublisherMock();
    useCase = new RepublishArtistProfilesUseCase(users, publisher);
  });

  it('publishes user.profile.updated for every user, page by page', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => buildUser({ id: `user-${i}` }));
    const secondPage = [buildUser({ id: 'user-100' })];
    const findAll = mock(async ({ offset }: { limit: number; offset: number }) =>
      offset === 0 ? firstPage : secondPage,
    );
    users.findAll = findAll;

    const result = await useCase.execute();

    expect(result).toEqual({ published: 101 });
    expect(findAll).toHaveBeenNthCalledWith(1, { limit: 100, offset: 0 });
    expect(findAll).toHaveBeenNthCalledWith(2, { limit: 100, offset: 100 });
    expect(publisher.publish).toHaveBeenCalledTimes(101);
  });

  it('propagates publish failures so the sync can be retried', async () => {
    users.findAll = async () => [buildUser()];
    publisher.publish = mock(async () => {
      throw new Error('RabbitMQ indisponível no momento.');
    });

    await expect(useCase.execute()).rejects.toThrow('RabbitMQ indisponível no momento.');
  });
});
