import { mock } from 'bun:test';

import type { ServiceRepository } from '@/application/port/service-repository.port';

export function createServiceRepositoryMock(): ServiceRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}
