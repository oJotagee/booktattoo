import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { ServiceEntity } from '@/domain/entities/service.entity';

type CreateServiceInput = {
  userId: string;
  name: string;
  duration: number;
  depositAmount: number;
};

type CreateServiceOutput = {
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
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
  ) {}

  async execute({
    userId,
    name,
    duration,
    depositAmount,
  }: CreateServiceInput): Promise<CreateServiceOutput> {
    const service = ServiceEntity.create({
      id: crypto.randomUUID(),
      name,
      duration,
      depositAmount,
      userId,
    });

    await this.services.create(service);

    return {
      id: service.id,
      name: service.name,
      duration: service.duration,
      depositAmount: service.depositAmount,
      status: service.status,
      userId: service.userId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
