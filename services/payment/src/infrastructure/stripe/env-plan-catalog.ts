import type { SubscriptionPlan } from '@bookink/shared/events';
import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import type { PlanCatalog } from '@/application/port/plan-catalog.port';
import { UnknownPriceError } from '@/domain/errors/billing.error';
import stripeConfig from '../config/stripe.config';

@Injectable()
export class EnvPlanCatalog implements PlanCatalog {
  constructor(
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {}

  priceIdFor(plan: SubscriptionPlan): string {
    return this.config.prices[plan];
  }

  planFor(priceId: string): SubscriptionPlan {
    const entry = Object.entries(this.config.prices).find(([, id]) => id === priceId);
    if (!entry) throw new UnknownPriceError(priceId);

    return entry[0] as SubscriptionPlan;
  }
}
