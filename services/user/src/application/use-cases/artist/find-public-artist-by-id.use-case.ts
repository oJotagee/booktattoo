import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';
import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { UserStatus } from '@/domain/entities/user.entity';

type PublicArtistOutput = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  role: string | null;
  status: string;
  times: string[];
};

@Injectable()
export class FindPublicArtistByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ id }: { id: string }): Promise<PublicArtistOutput> {
    const artist = await this.cache.getOrLoad(PUBLIC_ARTISTS_CACHE, `id=${id}`, async () => {
      const user = await this.users.findById(id);
      if (!user || user.status === UserStatus.INACTIVE) return null;

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        bio: user.bio,
        role: user.role,
        status: user.status,
        times: user.times,
      };
    });

    if (!artist) throw new UserNotFoundError(id);

    return artist;
  }
}
