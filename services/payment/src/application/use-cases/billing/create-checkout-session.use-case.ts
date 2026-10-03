import type { SubscriptionPlan } from '@bookink/shared/events';
import { Inject, Injectable } from '@nestjs/common';

import type { BillingCustomerRepository } from '../../port/billing-customer-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from '../../port/billing-customer-repository.port';
import { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';
import { SubscriptionAlreadyActiveError } from '@/domain/errors/billing.error';
import type { BillingGateway } from '../../port/billing-gateway.port';
import { BILLING_GATEWAY } from '../../port/billing-gateway.port';
import type { PlanCatalog } from '../../port/plan-catalog.port';
import { PLAN_CATALOG } from '../../port/plan-catalog.port';

type CreateCheckoutSessionInput = {
  userId: string;
  email: string;
  plan: SubscriptionPlan;
};

type CreateCheckoutSessionOutput = {
  url: string;
};

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(BILLING_CUSTOMER_REPOSITORY)
    private readonly customers: BillingCustomerRepository,
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
    @Inject(PLAN_CATALOG)
    private readonly plans: PlanCatalog,
  ) {}

  async execute({
    userId,
    email,
    plan,
  }: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    const customer = await this.findOrCreateCustomer(userId, email);

    if (await this.gateway.findActiveSubscription(customer.stripeCustomerId)) {
      throw new SubscriptionAlreadyActiveError();
    }

    return this.gateway.createCheckoutSession({
      customerId: customer.stripeCustomerId,
      priceId: this.plans.priceIdFor(plan),
      userId,
    });
  }

  private async findOrCreateCustomer(
    userId: string,
    email: string,
  ): Promise<BillingCustomerEntity> {
    const existing = await this.customers.findByUserId(userId);
    if (existing) return existing;

    const stripeCustomer = await this.gateway.createCustomer({ userId, email });

    const customer = BillingCustomerEntity.create({
      userId,
      email,
      stripeCustomerId: stripeCustomer.id,
    });

    await this.customers.create(customer);

    return customer;
  }
}
