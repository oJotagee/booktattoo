import { mock } from 'bun:test';

import type { ReminderRepository } from '@/application/port/reminder-repository.port';

export function createReminderRepositoryMock(): ReminderRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
    delete: mock(async () => undefined),
  };
}
