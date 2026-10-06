import { createEventEnvelope, type UserProfileUpdatedPayload } from '@bookink/shared/events';
import { describe, expect, it, mock } from 'bun:test';

import { UserEventsHandler } from '@/application/handlers/user-events.handler';
import { ArtistStatus } from '@/domain/entities/artist.entity';

const payload: UserProfileUpdatedPayload = {
  userId: 'user-1',
  name: 'Joao Guilherme',
  image: null,
  status: 'VACATION',
};

describe('UserEventsHandler', () => {
  it('syncs the artist with the event payload and occurredAt', async () => {
    const syncArtist = { execute: mock(async () => undefined) };
    const handler = new UserEventsHandler(syncArtist as never);
    const occurredAt = new Date('2026-10-06T12:00:00.000Z');

    await handler.handle(createEventEnvelope('user.profile.updated', payload, { occurredAt }));

    expect(syncArtist.execute).toHaveBeenCalledWith({
      artistId: 'user-1',
      name: 'Joao Guilherme',
      image: null,
      status: ArtistStatus.VACATION,
      occurredAt,
    });
  });
});
