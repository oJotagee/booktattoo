import { Inject, Injectable } from '@nestjs/common';

import { BILLING_GATEWAY, type BillingGateway } from '../../port/billing-gateway.port';

type RefundDepositInput = {
  appointmentId: string;
  checkoutSessionId: string;
};

type RefundDepositOutput = {
  refundId: string;
};

@Injectable()
export class RefundDepositUseCase {
  constructor(
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
  ) {}

  execute(input: RefundDepositInput): Promise<RefundDepositOutput> {
    return this.gateway.refundDeposit(input);
  }
}
