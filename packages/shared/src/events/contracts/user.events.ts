import type { EventEnvelope } from '../event-envelope';

export type UserProfileStatus = 'ACTIVE' | 'INACTIVE' | 'VACATION';

export type UserProfileUpdatedPayload = {
  userId: string;
  name: string;
  image: string | null;
  status: UserProfileStatus;
};

export type UserProfileUpdated = EventEnvelope<'user.profile.updated', UserProfileUpdatedPayload>;

export type UserProfileEvent = UserProfileUpdated;

export type UserProfileEventType = UserProfileEvent['type'];
