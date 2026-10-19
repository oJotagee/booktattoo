import { Inject, Injectable } from '@nestjs/common';

import { ConnectedAccountEntity } from '@/domain/entities/connected-account.entity';
import { CONNECT_GATEWAY, type ConnectGateway } from '../../port/connect-gateway.port';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';

type StartConnectOnboardingInput = {
  userId: string;
  email: string;
};

type StartConnectOnboardingOutput = {
  url: string;
};

@Injectable()
export class StartConnectOnboardingUseCase {
  constructor(
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly accounts: ConnectedAccountRepository,
    @Inject(CONNECT_GATEWAY)
    private readonly gateway: ConnectGateway,
  ) {}

  async execute({
    userId,
    email,
  }: StartConnectOnboardingInput): Promise<StartConnectOnboardingOutput> {
    let account = await this.accounts.findByUserId(userId);

    if (!account) {
      const { id } = await this.gateway.createAccount({ userId, email });
      account = ConnectedAccountEntity.create({ userId, stripeAccountId: id });
      await this.accounts.save(account);
    }

    return this.gateway.createOnboardingLink(account.stripeAccountId);
  }
}
