import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';

type SetGaleryAvailabilityInput = {
  galeryId: string;
  available: boolean;
};

@Injectable()
export class SetGaleryAvailabilityUseCase {
  private readonly logger = new Logger(SetGaleryAvailabilityUseCase.name);

  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ galeryId, available }: SetGaleryAvailabilityInput): Promise<void> {
    const galery = await this.galeries.findById(galeryId);

    if (!galery) {
      this.logger.warn(`Galeria ${galeryId} não encontrada ao sincronizar disponibilidade`);
      return;
    }

    if (galery.available === available) return;

    await this.galeries.update(available ? galery.activate() : galery.deactivate());
    await this.cache.invalidate(PUBLIC_GALERIES_CACHE);
  }
}
