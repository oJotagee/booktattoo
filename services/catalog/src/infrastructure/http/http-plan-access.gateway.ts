import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { PlanAccessGateway } from '@/application/port/plan-access-gateway.port';
import { PlanAccessUnavailableError } from '@/domain/errors/plan.error';
import userServiceConfig from '../config/user-service.config';
import type { PlanAccess } from '@/domain/plan/plan-access';

@Injectable()
export class HttpPlanAccessGateway implements PlanAccessGateway {
  private readonly logger = new Logger(HttpPlanAccessGateway.name);

  constructor(
    @Inject(userServiceConfig.KEY)
    private readonly config: ConfigType<typeof userServiceConfig>,
  ) {}

  async getPlanAccess(authorization: string): Promise<PlanAccess> {
    const url = `${this.config.url}/users/me/plan`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      this.logger.error(`Falha ao chamar ${url}: ${(error as Error).message}`);
      throw new PlanAccessUnavailableError();
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`${url} respondeu ${response.status}: ${body.slice(0, 300)}`);
      throw new PlanAccessUnavailableError();
    }

    try {
      const { status, limits } = (await response.json()) as PlanAccess;
      return { status, limits };
    } catch (error) {
      this.logger.error(`Resposta inválida de ${url}: ${(error as Error).message}`);
      throw new PlanAccessUnavailableError();
    }
  }
}
