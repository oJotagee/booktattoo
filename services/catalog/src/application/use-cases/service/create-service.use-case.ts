import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { ServiceEntity } from '@/domain/entities/service.entity';
import type { PlanAccessGateway } from '../../port/plan-access-gateway.port';
import { PLAN_ACCESS_GATEWAY } from '../../port/plan-access-gateway.port';
import { ensureWithinPlanLimit } from '@/domain/plan/plan-access';
import { PUBLIC_SERVICES_CACHE } from '@/application/cache/public-cache';

type CreateServiceInput = {
  userId: string;
  authorization: string;
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
    @Inject(PLAN_ACCESS_GATEWAY)
    private readonly planAccess: PlanAccessGateway,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({
    userId,
    authorization,
    name,
    duration,
    depositAmount,
  }: CreateServiceInput): Promise<CreateServiceOutput> {
    const [access, currentCount] = await Promise.all([
      this.planAccess.getPlanAccess(authorization),
      this.services.countByUserId(userId),
    ]);
    ensureWithinPlanLimit(access, 'services', currentCount);

    const service = ServiceEntity.create({
      id: crypto.randomUUID(),
      name,
      duration,
      depositAmount,
      userId,
    });

    await this.services.create(service);
    await this.cache.invalidate(PUBLIC_SERVICES_CACHE);

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
