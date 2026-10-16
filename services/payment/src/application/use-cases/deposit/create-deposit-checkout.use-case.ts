import { Inject, Injectable } from '@nestjs/common';

import { BILLING_GATEWAY, type BillingGateway } from '../../port/billing-gateway.port';

type CreateDepositCheckoutInput = {
  appointmentId: string;
  amount: number;
  title: string;
  imageUrl: string | null;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

type CreateDepositCheckoutOutput = {
  checkoutSessionId: string;
  url: string;
};

@Injectable()
export class CreateDepositCheckoutUseCase {
  constructor(
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
  ) {}

  async execute(input: CreateDepositCheckoutInput): Promise<CreateDepositCheckoutOutput> {
    const session = await this.gateway.createDepositCheckoutSession(input);

    return { checkoutSessionId: session.id, url: session.url };
  }
}
