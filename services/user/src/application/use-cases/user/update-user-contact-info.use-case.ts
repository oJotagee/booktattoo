import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';
import { userProfileUpdatedEvent } from '@/application/events/user-profile.events';

type UpdateUserContactInfoInput = {
  userId: string;
  name?: string;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  role?: string | null;
  times?: string[];
};

type UpdateUserContactInfoOutput = {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  role: string | null;
  times: string[];
  updatedAt: Date;
};

@Injectable()
export class UpdateUserContactInfoUseCase {
  private readonly logger = new Logger(UpdateUserContactInfoUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  async execute({
    userId,
    ...input
  }: UpdateUserContactInfoInput): Promise<UpdateUserContactInfoOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const updatedUser = user.updateContactInfo({
      name: input.name,
      address: input.address,
      phone: input.phone,
      bio: input.bio,
      role: input.role,
      times: input.times,
    });

    await this.users.update(updatedUser);
    await this.cache.invalidate(PUBLIC_ARTISTS_CACHE);
    await this.publisher
      .publish(userProfileUpdatedEvent(updatedUser))
      .catch((error: Error) =>
        this.logger.warn(
          `Falha ao publicar user.profile.updated de ${updatedUser.id}: ${error.message}`,
        ),
      );

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      image: updatedUser.image,
      address: updatedUser.address,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      role: updatedUser.role,
      times: updatedUser.times,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
