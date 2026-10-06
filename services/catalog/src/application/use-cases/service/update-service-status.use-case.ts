import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { type ServiceEntity } from '@/domain/entities/service.entity';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { PUBLIC_SERVICES_CACHE } from '@/application/cache/public-cache';

type UpdateServiceStatusInput = {
  serviceId: string;
  status: boolean;
  userId: string;
};

type UpdateServiceStatusOutput = {
  id: string;
  status: boolean;
  updatedAt: Date;
};

@Injectable()
export class UpdateServiceStatusUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({
    serviceId,
    status,
    userId,
  }: UpdateServiceStatusInput): Promise<UpdateServiceStatusOutput> {
    const service = await this.services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    if (service.userId !== userId) throw new ForbiddenResourceAccessError();

    const updatedService = this.applyStatus(service, status);

    await this.services.update(updatedService);
    await this.cache.invalidate(PUBLIC_SERVICES_CACHE);

    return {
      id: updatedService.id,
      status: updatedService.status,
      updatedAt: updatedService.updatedAt,
    };
  }

  private applyStatus(service: ServiceEntity, status: boolean): ServiceEntity {
    if (status) {
      return service.activate();
    } else {
      return service.deactivate();
    }
  }
}
