import { Inject, Injectable } from '@nestjs/common';

import {
  CONNECT_GATEWAY,
  type ConnectGateway,
  type ConnectRequirement,
} from '../../port/connect-gateway.port';
import { SyncConnectedAccountUseCase } from './sync-connected-account.use-case';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';

type GetConnectStatusInput = {
  userId: string;
};

export type GetConnectStatusOutput = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  paymentsEnabled: boolean;
  pendingRequirements: ConnectRequirement[];
};

@Injectable()
export class GetConnectStatusUseCase {
  constructor(
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly accounts: ConnectedAccountRepository,
    @Inject(CONNECT_GATEWAY)
    private readonly gateway: ConnectGateway,
    private readonly syncConnectedAccount: SyncConnectedAccountUseCase,
  ) {}

  async execute({ userId }: GetConnectStatusInput): Promise<GetConnectStatusOutput> {
    const account = await this.accounts.findByUserId(userId);

    if (!account) {
      return {
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        paymentsEnabled: false,
        pendingRequirements: [],
      };
    }

    const { status, pendingRequirements } = await this.gateway.retrieveAccount(
      account.stripeAccountId,
    );
    const synced = await this.syncConnectedAccount.execute({ account, status });

    return {
      connected: true,
      chargesEnabled: synced.chargesEnabled,
      payoutsEnabled: synced.payoutsEnabled,
      detailsSubmitted: synced.detailsSubmitted,
      paymentsEnabled: synced.paymentsEnabled,
      pendingRequirements,
    };
  }
}
