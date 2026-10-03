import { Inject, Injectable } from '@nestjs/common';

import type { BillingCustomerRepository } from '../../port/billing-customer-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from '../../port/billing-customer-repository.port';
import { BillingCustomerNotFoundError } from '@/domain/errors/billing.error';
import type { BillingGateway } from '../../port/billing-gateway.port';
import { BILLING_GATEWAY } from '../../port/billing-gateway.port';

type CreatePortalSessionInput = {
  userId: string;
};

type CreatePortalSessionOutput = {
  url: string;
};

@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    @Inject(BILLING_CUSTOMER_REPOSITORY)
    private readonly customers: BillingCustomerRepository,
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
  ) {}

  async execute({ userId }: CreatePortalSessionInput): Promise<CreatePortalSessionOutput> {
    const customer = await this.customers.findByUserId(userId);
    if (!customer) throw new BillingCustomerNotFoundError();

    return this.gateway.createPortalSession(customer.stripeCustomerId);
  }
}
