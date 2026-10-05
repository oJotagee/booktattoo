import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  ttlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 900),
  refreshAheadSeconds: Number(process.env.CACHE_REFRESH_AHEAD_SECONDS ?? 30),
  lockTtlMs: Number(process.env.CACHE_LOCK_TTL_MS ?? 10_000),
  waitTimeoutMs: Number(process.env.CACHE_WAIT_TIMEOUT_MS ?? 5_000),
  pollIntervalMs: Number(process.env.CACHE_POLL_INTERVAL_MS ?? 50),
}));
