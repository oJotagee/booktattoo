import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';

type SyncPaymentsEnabledInput = {
  userId: string;
  paymentsEnabled: boolean;
};

@Injectable()
export class SyncPaymentsEnabledUseCase {
  private readonly logger = new Logger(SyncPaymentsEnabledUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ userId, paymentsEnabled }: SyncPaymentsEnabledInput): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      this.logger.warn(`Conta Stripe atualizada para o usuário ${userId}, que não existe`);
      return;
    }

    if (user.paymentsEnabled === paymentsEnabled) return;

    await this.users.update(user.setPaymentsEnabled(paymentsEnabled));
    await this.cache.invalidate(PUBLIC_ARTISTS_CACHE);
  }
}
