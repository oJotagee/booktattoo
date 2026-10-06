import type { UserProfileEvent } from '@bookink/shared/events';
import { Injectable } from '@nestjs/common';

import { SyncArtistUseCase } from '../use-cases/artist/sync-artist.use-case';
import { ArtistStatus } from '@/domain/entities/artist.entity';

@Injectable()
export class UserEventsHandler {
  constructor(private readonly syncArtist: SyncArtistUseCase) {}

  async handle(event: UserProfileEvent): Promise<void> {
    switch (event.type) {
      case 'user.profile.updated':
        return this.onProfileUpdated(event);
    }
  }

  private async onProfileUpdated({ payload, occurredAt }: UserProfileEvent): Promise<void> {
    await this.syncArtist.execute({
      artistId: payload.userId,
      name: payload.name,
      image: payload.image,
      status: ArtistStatus[payload.status],
      occurredAt: new Date(occurredAt),
    });
  }
}
