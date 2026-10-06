import type { CachePort } from '@bookink/shared/cache';
import type { EventPublisher } from '@bookink/shared/events';
import type { MailPort } from '@bookink/shared/mail';
import { mock } from 'bun:test';

import type { AccountRepository } from '@/application/port/account-repository.port';
import type { PasswordHasher } from '@/application/port/password-hasher.port';
import type { PasswordResetTokenRepository } from '@/application/port/password-reset-token-repository.port';
import type { RefreshTokenRepository } from '@/application/port/refresh-token-repository.port';
import type { SessionTokenIssuer } from '@/application/port/session-token-issuer.port';
import type { SubscriptionRepository } from '@/application/port/subscription-repository.port';
import type { TokenGenerator } from '@/application/port/token-generator.port';
import type { UserRepository } from '@/application/port/user-repository.port';

export function createUserRepositoryMock(): UserRepository {
  return {
    findById: mock(async () => null),
    findByEmail: mock(async () => null),
    findPublicArtists: mock(async () => ({ items: [], total: 0 })),
    findAll: mock(async () => []),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createAccountRepositoryMock(): AccountRepository {
  return {
    findByProvider: mock(async () => null),
    findByUserId: mock(async () => []),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createRefreshTokenRepositoryMock(): RefreshTokenRepository {
  return {
    findByTokenHash: mock(async () => null),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createPasswordHasherMock(): PasswordHasher {
  return {
    hash: mock(async (plainPassword: string) => `hashed:${plainPassword}`),
    compare: mock(async () => true),
  };
}

export function createSessionTokenIssuerMock(): SessionTokenIssuer {
  return {
    issueAccessToken: mock(() => 'access-token'),
  };
}

export function createTokenGeneratorMock(): TokenGenerator {
  return {
    generateOpaqueToken: mock(() => 'opaque-refresh-token'),
    hashOpaqueToken: mock((token: string) => `hashed:${token}`),
  };
}

export function createPasswordResetTokenRepositoryMock(): PasswordResetTokenRepository {
  return {
    findByTokenHash: mock(async () => null),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createMailPortMock(): MailPort {
  return {
    send: mock(async () => undefined),
  };
}

export function createSubscriptionRepositoryMock(): SubscriptionRepository {
  return {
    findByUserId: mock(async () => null),
    save: mock(async () => undefined),
  };
}

export function createCacheMock(): CachePort {
  return {
    getOrLoad: mock((_namespace: string, _key: string, loader: () => Promise<unknown>) =>
      loader(),
    ) as CachePort['getOrLoad'],
    invalidate: mock(async () => undefined),
  };
}

export function createEventPublisherMock(): EventPublisher {
  return {
    publish: mock(async () => undefined),
  };
}
