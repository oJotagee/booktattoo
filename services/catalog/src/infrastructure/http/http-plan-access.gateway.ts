import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import type { PlanAccessGateway } from '@/application/port/plan-access-gateway.port';
import { PlanAccessUnavailableError } from '@/domain/errors/plan.error';
import userServiceConfig from '../config/user-service.config';
import type { PlanAccess } from '@/domain/plan/plan-access';

@Injectable()
export class HttpPlanAccessGateway implements PlanAccessGateway {
  constructor(
    @Inject(userServiceConfig.KEY)
    private readonly config: ConfigType<typeof userServiceConfig>,
  ) {}

  async getPlanAccess(authorization: string): Promise<PlanAccess> {
    try {
      const response = await fetch(`${this.config.url}/users/me/plan`, {
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new PlanAccessUnavailableError();

      const { status, limits } = (await response.json()) as PlanAccess;

      return { status, limits };
    } catch {
      throw new PlanAccessUnavailableError();
    }
  }
}
