import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { RedisCacheAdapter } from './redis-cache.adapter';
import { CACHE_PORT } from './cache.port';
import cacheConfig from './cache.config';

@Module({
  imports: [ConfigModule.forFeature(cacheConfig)],
  providers: [
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
  ],
  exports: [CACHE_PORT],
})
export class CacheModule {}
