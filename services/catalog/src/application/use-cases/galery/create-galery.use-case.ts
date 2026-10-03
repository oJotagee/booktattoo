import { ASSET_TYPES, STORAGE_PORT, type StoragePort } from '@bookink/shared/storage';
import { Inject, Injectable } from '@nestjs/common';

import { GaleryEntity, type GaleryStyle } from '@/domain/entities/galery.entity';
import type { ServiceRepository } from '../../port/service-repository.port';
import type { GaleryRepository } from '../../port/galery-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { extractStorageKey } from '../../utils/storage-key';
import type { PlanAccessGateway } from '../../port/plan-access-gateway.port';
import { PLAN_ACCESS_GATEWAY } from '../../port/plan-access-gateway.port';
import { ensureWithinPlanLimit } from '@/domain/plan/plan-access';

type CreateGaleryInput = {
  userId: string;
  authorization: string;
  serviceId: string;
  title: string;
  size: string;
  price: number;
  style: GaleryStyle;
  image: {
    filename: string;
    contentType: string;
    body: Buffer;
  };
};

type CreateGaleryOutput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateGaleryUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
    @Inject(PLAN_ACCESS_GATEWAY)
    private readonly planAccess: PlanAccessGateway,
  ) {}

  async execute({
    userId,
    authorization,
    serviceId,
    image,
    ...input
  }: CreateGaleryInput): Promise<CreateGaleryOutput> {
    const service = await this.services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    if (service.userId !== userId) throw new ForbiddenResourceAccessError();

    const [access, currentCount] = await Promise.all([
      this.planAccess.getPlanAccess(authorization),
      this.galeries.countByUserId(userId),
    ]);
    ensureWithinPlanLimit(access, 'galeries', currentCount);

    const { url } = await this.storage.upload({
      assetType: ASSET_TYPES.GALLERY,
      ownerId: userId,
      filename: image.filename,
      contentType: image.contentType,
      body: image.body,
    });

    let galery: GaleryEntity;

    try {
      galery = GaleryEntity.create({
        id: crypto.randomUUID(),
        imageUrl: url,
        userId,
        serviceId,
        ...input,
      });

      await this.galeries.create(galery);
    } catch (error) {
      await this.deleteImage(url);
      throw error;
    }

    return {
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      size: galery.size,
      price: galery.price,
      style: galery.style,
      available: galery.available,
      userId: galery.userId,
      serviceId: galery.serviceId,
      createdAt: galery.createdAt,
      updatedAt: galery.updatedAt,
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
