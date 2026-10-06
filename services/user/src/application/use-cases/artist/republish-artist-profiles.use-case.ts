import { EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { userProfileUpdatedEvent } from '@/application/events/user-profile.events';

const BATCH_SIZE = 100;

type RepublishArtistProfilesOutput = {
  published: number;
};

@Injectable()
export class RepublishArtistProfilesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  async execute(): Promise<RepublishArtistProfilesOutput> {
    let published = 0;

    for (let offset = 0; ; offset += BATCH_SIZE) {
      const batch = await this.users.findAll({ limit: BATCH_SIZE, offset });

      for (const user of batch) {
        await this.publisher.publish(userProfileUpdatedEvent(user));
        published++;
      }

      if (batch.length < BATCH_SIZE) return { published };
    }
  }
}
