import { Inject, Injectable } from '@nestjs/common';

import { BILLING_GATEWAY, type BillingGateway } from '../../port/billing-gateway.port';

type ExpireDepositCheckoutInput = {
  checkoutSessionId: string;
};

@Injectable()
export class ExpireDepositCheckoutUseCase {
  constructor(
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
  ) {}

  execute({ checkoutSessionId }: ExpireDepositCheckoutInput): Promise<void> {
    return this.gateway.expireDepositCheckout(checkoutSessionId);
  }
}
