import { mock } from 'bun:test';

import type { ServiceRepository } from '@/application/port/service-repository.port';
import type { GaleryRepository } from '@/application/port/galery-repository.port';
import type { StoragePort } from '@bookink/shared/storage';

export function createServiceRepositoryMock(): ServiceRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

export function createGaleryRepositoryMock(): GaleryRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
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
