import type { CachePort } from '@bookink/shared/cache';
import { mock } from 'bun:test';

import type { ArtistRepository } from '@/application/port/artist-repository.port';
import type { PlanAccessGateway } from '@/application/port/plan-access-gateway.port';
import type { ServiceRepository } from '@/application/port/service-repository.port';
import type { GaleryRepository } from '@/application/port/galery-repository.port';
import type { StoragePort } from '@bookink/shared/storage';
import type { PlanAccess } from '@/domain/plan/plan-access';

export function createServiceRepositoryMock(): ServiceRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    findPublic: mock(async () => ({ items: [], total: 0 })),
    countByUserId: mock(async () => 0),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createGaleryRepositoryMock(): GaleryRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    findPublic: mock(async () => ({ items: [], total: 0 })),
    countByUserId: mock(async () => 0),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
    delete: mock(async () => undefined),
  };
}

export function createStorageMock(): StoragePort {
  return {
    upload: mock(async () => ({
      key: 'gallery/user-1/new-image.png',
      url: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/new-image.png',
    })),
    delete: mock(async () => undefined),
    getSignedUrl: mock(async () => 'https://signed-url'),
  };
}

export function createPlanAccessGatewayMock(): PlanAccessGateway {
  return {
    getPlanAccess: mock(
      async (): Promise<PlanAccess> => ({
        status: 'TRIAL',
        limits: { services: 20, galeries: 50 },
      }),
    ),
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

export function createArtistRepositoryMock(): ArtistRepository {
  return {
    findById: mock(async () => null),
    findByIds: mock(async () => []),
    findInactiveIds: mock(async () => []),
    save: mock(async () => undefined),
  };
}
