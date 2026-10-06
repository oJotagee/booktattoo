import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';

import type { CachePort } from './cache.port';
import cacheConfig from './cache.config';

const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

type CachedEntry<T> = {
  value: T;
  remainingMs: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class RedisCacheAdapter implements CachePort, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private readonly redis: Redis;
  private readonly inflight = new Map<string, Promise<unknown>>();
  private readonly ttlMs: number;
  private readonly refreshAheadMs: number;

  constructor(
    @Inject(cacheConfig.KEY)
    private readonly config: ConfigType<typeof cacheConfig>,
  ) {
    this.ttlMs = config.ttlSeconds * 1000;
    this.refreshAheadMs = config.refreshAheadSeconds * 1000;

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

  async getOrLoad<T>(namespace: string, key: string, loader: () => Promise<T>): Promise<T> {
    let fullKey: string;
    let cached: CachedEntry<T> | null;

    try {
      fullKey = `${namespace}:v${await this.generation(namespace)}:${key}`;
      cached = await this.read<T>(fullKey);
    } catch {
      return loader();
    }

    if (cached && !this.isNearExpiry(cached)) {
      return cached.value;
    }

    const pending = this.inflight.get(fullKey) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    const refresh = this.refresh(fullKey, loader, cached).finally(() => {
      this.inflight.delete(fullKey);
    });
    this.inflight.set(fullKey, refresh);

    return refresh;
  }

  async invalidate(namespace: string): Promise<void> {
    try {
      await this.redis.incr(this.generationKey(namespace));
    } catch (error) {
      this.logger.warn(`Falha ao invalidar o cache ${namespace}: ${(error as Error).message}`);
    }
  }

  private async generation(namespace: string): Promise<string> {
    return (await this.redis.get(this.generationKey(namespace))) ?? '0';
  }

  private generationKey(namespace: string): string {
    return `${namespace}:generation`;
  }

  private async refresh<T>(
    key: string,
    loader: () => Promise<T>,
    stale: CachedEntry<T> | null,
  ): Promise<T> {
    const lockKey = `${key}:lock`;
    const token = randomUUID();

    let acquired: boolean;
    try {
      acquired = (await this.redis.set(lockKey, token, 'PX', this.config.lockTtlMs, 'NX')) === 'OK';
    } catch {
      return stale ? stale.value : loader();
    }

    if (acquired) {
      try {
        const value = await loader();
        await this.redis.set(key, JSON.stringify(value), 'PX', this.ttlMs).catch(() => undefined);
        return value;
      } finally {
        await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token).catch(() => undefined);
      }
    }

    const fresh = await this.waitForRefresh<T>(key, lockKey).catch(() => null);
    if (fresh) {
      return fresh.value;
    }

    return stale ? stale.value : loader();
  }

  private async waitForRefresh<T>(key: string, lockKey: string): Promise<CachedEntry<T> | null> {
    const deadline = Date.now() + this.config.waitTimeoutMs;

    while (Date.now() < deadline) {
      await sleep(this.config.pollIntervalMs);

      if (await this.redis.exists(lockKey)) {
        continue;
      }

      const cached = await this.read<T>(key);
      return cached && !this.isNearExpiry(cached) ? cached : null;
    }

    return null;
  }

  private async read<T>(key: string): Promise<CachedEntry<T> | null> {
    const results = await this.redis.pipeline().get(key).pttl(key).exec();
    if (!results) {
      return null;
    }

    const [[getError, raw], [pttlError, remainingMs]] = results;
    if (getError || pttlError) {
      throw getError ?? pttlError;
    }

    if (typeof raw !== 'string') {
      return null;
    }

    return { value: JSON.parse(raw) as T, remainingMs: remainingMs as number };
  }

  private isNearExpiry(entry: CachedEntry<unknown>): boolean {
    return entry.remainingMs <= this.refreshAheadMs;
  }
}
