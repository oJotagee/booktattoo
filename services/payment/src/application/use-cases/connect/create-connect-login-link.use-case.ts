import { Inject, Injectable } from '@nestjs/common';

import { CONNECT_GATEWAY, type ConnectGateway } from '../../port/connect-gateway.port';
import {
  ConnectedAccountNotFoundError,
  ConnectedAccountNotReadyError,
} from '@/domain/errors/billing.error';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';

type CreateConnectLoginLinkInput = {
  userId: string;
};

type CreateConnectLoginLinkOutput = {
  url: string;
};

@Injectable()
export class CreateConnectLoginLinkUseCase {
  constructor(
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly accounts: ConnectedAccountRepository,
    @Inject(CONNECT_GATEWAY)
    private readonly gateway: ConnectGateway,
  ) {}

  async execute({ userId }: CreateConnectLoginLinkInput): Promise<CreateConnectLoginLinkOutput> {
    const account = await this.accounts.findByUserId(userId);
    if (!account) throw new ConnectedAccountNotFoundError();
    if (!account.detailsSubmitted) throw new ConnectedAccountNotReadyError();

    return this.gateway.createLoginLink(account.stripeAccountId);
  }
}
