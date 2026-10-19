import { Inject, Injectable } from '@nestjs/common';

import { ConnectedAccountNotReadyError } from '@/domain/errors/billing.error';
import { BILLING_GATEWAY, type BillingGateway } from '../../port/billing-gateway.port';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';

type CreateDepositCheckoutInput = {
  appointmentId: string;
  artistId: string;
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
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly connectedAccounts: ConnectedAccountRepository,
  ) {}

  async execute({
    artistId,
    ...input
  }: CreateDepositCheckoutInput): Promise<CreateDepositCheckoutOutput> {
    const account = await this.connectedAccounts.findByUserId(artistId);
    if (!account?.paymentsEnabled) throw new ConnectedAccountNotReadyError();

    const session = await this.gateway.createDepositCheckoutSession({
      ...input,
      destinationAccountId: account.stripeAccountId,
    });

    return { checkoutSessionId: session.id, url: session.url };
  }
}
