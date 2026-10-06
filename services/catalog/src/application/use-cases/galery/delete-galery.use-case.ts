import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { ASSET_TYPES, STORAGE_PORT, type StoragePort } from '@bookink/shared/storage';
import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { extractStorageKey } from '../../utils/storage-key';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';

@Injectable()
export class DeleteGaleryUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const galery = await this.galeries.findById(id);
    if (!galery) throw new GaleryNotFoundError(id);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

    await this.galeries.delete(id);
    await this.cache.invalidate(PUBLIC_GALERIES_CACHE);

    await this.deleteImage(galery.imageUrl);
  }

  private async deleteImage(url: string): Promise<void> {
    const key = extractStorageKey(url, ASSET_TYPES.GALLERY);
    if (!key) return;

    try {
      await this.storage.delete(key);
    } catch {}
  }
}
