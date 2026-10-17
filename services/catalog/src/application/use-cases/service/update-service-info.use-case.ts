import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { PUBLIC_GALERIES_CACHE, PUBLIC_SERVICES_CACHE } from '@/application/cache/public-cache';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import type { ServiceRepository } from '../../port/service-repository.port';
import type { GaleryRepository } from '../../port/galery-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import {
  ServiceDepositAboveGaleryPriceError,
  ServiceNotFoundError,
} from '@/domain/errors/service.error';

type UpdateServiceInfoInput = {
  serviceId: string;
  userId: string;
  name?: string;
  duration?: number;
  depositAmount?: number;
};

type UpdateServiceInfoOutput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateServiceInfoUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ serviceId, ...input }: UpdateServiceInfoInput): Promise<UpdateServiceInfoOutput> {
    const service = await this.services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    if (service.userId !== input.userId) throw new ForbiddenResourceAccessError();

    if (input.depositAmount !== undefined && input.depositAmount > service.depositAmount) {
      const lowestPrice = await this.galeries.findLowestPriceByServiceId(serviceId);

      if (lowestPrice !== null && lowestPrice < input.depositAmount) {
        throw new ServiceDepositAboveGaleryPriceError();
      }
    }

    const updatedService = service.updateInfo({
      name: input.name,
      duration: input.duration,
      depositAmount: input.depositAmount,
    });

    await this.services.update(updatedService);

    await Promise.all([
      this.cache.invalidate(PUBLIC_SERVICES_CACHE),
      this.cache.invalidate(PUBLIC_GALERIES_CACHE),
    ]);

    return {
      id: updatedService.id,
      name: updatedService.name,
      duration: updatedService.duration,
      depositAmount: updatedService.depositAmount,
      status: updatedService.status,
      userId: updatedService.userId,
      createdAt: updatedService.createdAt,
      updatedAt: updatedService.updatedAt,
    };
  }
}
