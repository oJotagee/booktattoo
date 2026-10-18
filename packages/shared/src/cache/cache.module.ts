import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { RedisAttemptLimiter } from './redis-attempt-limiter.adapter';
import { RedisCacheAdapter } from './redis-cache.adapter';
import { ATTEMPT_LIMITER } from './attempt-limiter.port';
import { CACHE_PORT } from './cache.port';
import cacheConfig from './cache.config';

@Module({
  imports: [ConfigModule.forFeature(cacheConfig)],
  providers: [
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: ATTEMPT_LIMITER,
      useClass: RedisAttemptLimiter,
    },
  ],
  exports: [CACHE_PORT, ATTEMPT_LIMITER],
})
export class CacheModule {}
