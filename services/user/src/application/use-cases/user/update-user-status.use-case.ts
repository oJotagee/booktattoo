import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { type UserEntity, UserStatus } from '@/domain/entities/user.entity';
import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';

type UpdateUserStatusInput = {
  userId: string;
  status: UserStatus;
};

type UpdateUserStatusOutput = {
  id: string;
  status: UserStatus;
  updatedAt: Date;
};

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ userId, status }: UpdateUserStatusInput): Promise<UpdateUserStatusOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const updatedUser = this.applyStatus(user, status);

    await this.users.update(updatedUser);
    await this.cache.invalidate(PUBLIC_ARTISTS_CACHE);

    return {
      id: updatedUser.id,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }

  private applyStatus(user: UserEntity, status: UserStatus): UserEntity {
    switch (status) {
      case UserStatus.ACTIVE:
        return user.activate();
      case UserStatus.INACTIVE:
        return user.deactivate();
      case UserStatus.VACATION:
        return user.setOnVacation();
    }
  }
}
