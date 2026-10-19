import { beforeEach, describe, expect, it } from 'bun:test';

import { SyncPaymentsEnabledUseCase } from '@/application/use-cases/user/sync-payments-enabled.use-case';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';
import { createCacheMock, createUserRepositoryMock } from '@tests/unit/support/mocks';
import { buildUser } from '@tests/unit/support/builders';

describe('SyncPaymentsEnabledUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: SyncPaymentsEnabledUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    cache = createCacheMock();
    useCase = new SyncPaymentsEnabledUseCase(users, cache);
  });

  it('saves the flag and invalidates the public artists cache', async () => {
    users.findById = async () => buildUser();

    await useCase.execute({ userId: 'user-1', paymentsEnabled: true });

    expect(users.update).toHaveBeenCalledWith(expect.objectContaining({ paymentsEnabled: true }));
    expect(cache.invalidate).toHaveBeenCalledWith(PUBLIC_ARTISTS_CACHE);
  });

  it('does nothing when the flag is unchanged', async () => {
    users.findById = async () => buildUser();

    await useCase.execute({ userId: 'user-1', paymentsEnabled: false });

    expect(users.update).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('ignores unknown users', async () => {
    await useCase.execute({ userId: 'missing', paymentsEnabled: true });

    expect(users.update).not.toHaveBeenCalled();
  });
});
