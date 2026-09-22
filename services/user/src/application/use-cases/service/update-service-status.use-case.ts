import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { type ServiceEntity } from '@/domain/entities/service.entity';
import { ServiceNotFoundError } from '@/domain/errors/service.error';

type UpdateServiceStatusInput = {
  serviceId: string;
  status: boolean;
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
  ) {}

  async execute({
    serviceId,
    status,
  }: UpdateServiceStatusInput): Promise<UpdateServiceStatusOutput> {
    const service = await this.services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    const updatedService = this.applyStatus(service, status);

    await this.services.update(updatedService);

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
