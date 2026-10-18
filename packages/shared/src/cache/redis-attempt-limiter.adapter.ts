import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';

import type { AttemptLimiter, AttemptResult } from './attempt-limiter.port';
import cacheConfig from './cache.config';

const ALLOWED: AttemptResult = { allowed: true, retryAfterSeconds: 0 };

@Injectable()
export class RedisAttemptLimiter implements AttemptLimiter, OnModuleDestroy {
  private readonly logger = new Logger(RedisAttemptLimiter.name);
  private readonly redis: Redis;

  constructor(
    @Inject(cacheConfig.KEY)
    config: ConfigType<typeof cacheConfig>,
  ) {
    this.redis = new Redis(config.url, {
      family: 0,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    this.redis.on('error', (error) => {
      this.logger.warn(`Redis indisponível: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
  }

  async consume(key: string, limit: number, windowSeconds: number): Promise<AttemptResult> {
    try {
      const results = await this.redis
        .multi()
        .incr(key)
        .expire(key, windowSeconds, 'NX')
        .ttl(key)
        .exec();

      const count = Number(results?.[0]?.[1] ?? 0);
      let ttl = Number(results?.[2]?.[1] ?? windowSeconds);

      if (count === limit) {
        await this.redis.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      return count <= limit ? ALLOWED : { allowed: false, retryAfterSeconds: Math.max(ttl, 1) };
    } catch (error) {
      this.logger.warn(`Falha ao registrar tentativa ${key}: ${(error as Error).message}`);
      return ALLOWED;
    }
  }

  async peek(key: string, limit: number): Promise<AttemptResult> {
    try {
      const results = await this.redis.multi().get(key).ttl(key).exec();

      const count = Number(results?.[0]?.[1] ?? 0);
      const ttl = Number(results?.[1]?.[1] ?? 0);

      return count < limit ? ALLOWED : { allowed: false, retryAfterSeconds: Math.max(ttl, 1) };
    } catch (error) {
      this.logger.warn(`Falha ao consultar tentativas ${key}: ${(error as Error).message}`);
      return ALLOWED;
    }
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key).catch(() => undefined);
  }
}
