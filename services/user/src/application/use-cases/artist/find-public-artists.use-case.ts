import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

type FindPublicArtistsInput = {
  limit?: number;
  offset?: number;
};

type PublicArtistOutput = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  role: string | null;
  status: string;
  times: string[];
};

type FindPublicArtistsOutput = {
  list: PublicArtistOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindPublicArtistsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ limit, offset }: FindPublicArtistsInput): Promise<FindPublicArtistsOutput> {
    const perPage = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const currentOffset = offset ?? DEFAULT_OFFSET;
    const key = `limit=${perPage}:offset=${currentOffset}`;

    return this.cache.getOrLoad(PUBLIC_ARTISTS_CACHE, key, async () => {
      const { items, total } = await this.users.findPublicArtists({
        limit: perPage,
        offset: currentOffset,
      });

      return {
        list: items.map((user) => ({
          id: user.id,
          name: user.name,
          image: user.image,
          bio: user.bio,
          role: user.role,
          status: user.status,
          times: user.times,
        })),
        pagination: {
          total,
          page: Math.floor(currentOffset / perPage) + 1,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      };
    });
  }
}
