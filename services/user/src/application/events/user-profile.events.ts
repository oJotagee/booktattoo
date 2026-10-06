import { createEventEnvelope, type UserProfileUpdated } from '@bookink/shared/events';

import type { UserEntity } from '@/domain/entities/user.entity';

export function userProfileUpdatedEvent(user: UserEntity): UserProfileUpdated {
  return createEventEnvelope(
    'user.profile.updated',
    {
      userId: user.id,
      name: user.name,
      image: user.image,
      status: user.status,
    },
    { occurredAt: user.updatedAt, correlationId: user.id },
  );
}
