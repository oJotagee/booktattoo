import type { SubscriptionPlan } from '@bookink/shared/events';
import { Inject, Injectable } from '@nestjs/common';

import { NoActiveSubscriptionError, PlanAlreadyActiveError } from '@/domain/errors/billing.error';
import type { BillingCustomerRepository } from '../../port/billing-customer-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from '../../port/billing-customer-repository.port';
import type { BillingGateway } from '../../port/billing-gateway.port';
import { BILLING_GATEWAY } from '../../port/billing-gateway.port';
import type { PlanCatalog } from '../../port/plan-catalog.port';
import { PLAN_CATALOG } from '../../port/plan-catalog.port';

type ChangePlanInput = {
  userId: string;
  plan: SubscriptionPlan;
};

type ChangePlanOutput = {
  plan: SubscriptionPlan;
};

@Injectable()
export class ChangePlanUseCase {
  constructor(
    @Inject(BILLING_CUSTOMER_REPOSITORY)
    private readonly customers: BillingCustomerRepository,
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
    @Inject(PLAN_CATALOG)
    private readonly plans: PlanCatalog,
  ) {}

  async execute({ userId, plan }: ChangePlanInput): Promise<ChangePlanOutput> {
    const customer = await this.customers.findByUserId(userId);
    if (!customer) throw new NoActiveSubscriptionError();

    const subscription = await this.gateway.findActiveSubscription(customer.stripeCustomerId);
    if (!subscription) throw new NoActiveSubscriptionError();

    const priceId = this.plans.priceIdFor(plan);
    if (subscription.priceId === priceId) throw new PlanAlreadyActiveError();

    await this.gateway.changeSubscriptionPrice({
      subscriptionId: subscription.id,
      itemId: subscription.itemId,
      priceId,
    });

    return { plan };
  }
}
