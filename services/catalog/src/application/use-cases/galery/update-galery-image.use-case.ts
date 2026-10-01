import { ASSET_TYPES, STORAGE_PORT, type StoragePort } from '@bookink/shared/storage';
import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { extractStorageKey } from '../../utils/storage-key';

type UpdateGaleryImageInput = {
  galeryId: string;
  userId: string;
  filename: string;
  contentType: string;
  body: Buffer;
};

type UpdateGaleryImageOutput = {
  id: string;
  imageUrl: string;
  updatedAt: Date;
};

@Injectable()
export class UpdateGaleryImageUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async execute({
    galeryId,
    userId,
    filename,
    contentType,
    body,
  }: UpdateGaleryImageInput): Promise<UpdateGaleryImageOutput> {
    const galery = await this.galeries.findById(galeryId);
    if (!galery) throw new GaleryNotFoundError(galeryId);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

    const previousImageUrl = galery.imageUrl;

    const { url } = await this.storage.upload({
      assetType: ASSET_TYPES.GALLERY,
      ownerId: userId,
      filename,
      contentType,
      body,
    });

    const updatedGalery = galery.updateImage(url);
    await this.galeries.update(updatedGalery);

    await this.deleteImage(previousImageUrl);

    return {
      id: updatedGalery.id,
      imageUrl: updatedGalery.imageUrl,
      updatedAt: updatedGalery.updatedAt,
    };
  }

  private async deleteImage(url: string): Promise<void> {
    const key = extractStorageKey(url, ASSET_TYPES.GALLERY);
    if (!key) return;

    try {
      await this.storage.delete(key);
    } catch {}
  }
}
