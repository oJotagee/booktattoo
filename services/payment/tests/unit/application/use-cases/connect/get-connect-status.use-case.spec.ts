import { beforeEach, describe, expect, it } from 'bun:test';

import { SyncConnectedAccountUseCase } from '@/application/use-cases/connect/sync-connected-account.use-case';
import { GetConnectStatusUseCase } from '@/application/use-cases/connect/get-connect-status.use-case';
import { buildConnectedAccount } from '@tests/unit/support/builders';
import {
  createConnectedAccountRepositoryMock,
  createConnectGatewayMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

describe('GetConnectStatusUseCase', () => {
  let accounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let gateway: ReturnType<typeof createConnectGatewayMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: GetConnectStatusUseCase;

  beforeEach(() => {
    accounts = createConnectedAccountRepositoryMock();
    gateway = createConnectGatewayMock();
    publisher = createEventPublisherMock();
    useCase = new GetConnectStatusUseCase(
      accounts,
      gateway,
      new SyncConnectedAccountUseCase(accounts, publisher),
    );
  });

  it('reports not connected when the artist has no account', async () => {
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual({
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      paymentsEnabled: false,
    });
    expect(gateway.retrieveAccountStatus).not.toHaveBeenCalled();
  });

  it('refreshes the status from Stripe and syncs it', async () => {
    accounts.findByUserId = async () =>
      buildConnectedAccount({ chargesEnabled: false, payoutsEnabled: false });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(gateway.retrieveAccountStatus).toHaveBeenCalledWith('acct_123');
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      connected: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      paymentsEnabled: true,
    });
  });
});
