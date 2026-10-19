import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateConnectLoginLinkUseCase } from '@/application/use-cases/connect/create-connect-login-link.use-case';
import { buildConnectedAccount } from '@tests/unit/support/builders';
import {
  ConnectedAccountNotFoundError,
  ConnectedAccountNotReadyError,
} from '@/domain/errors/billing.error';
import {
  createConnectedAccountRepositoryMock,
  createConnectGatewayMock,
} from '@tests/unit/support/mocks';

describe('CreateConnectLoginLinkUseCase', () => {
  let accounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let gateway: ReturnType<typeof createConnectGatewayMock>;
  let useCase: CreateConnectLoginLinkUseCase;

  beforeEach(() => {
    accounts = createConnectedAccountRepositoryMock();
    gateway = createConnectGatewayMock();
    useCase = new CreateConnectLoginLinkUseCase(accounts, gateway);
  });

  it('returns the express dashboard link', async () => {
    accounts.findByUserId = async () => buildConnectedAccount();

    const result = await useCase.execute({ userId: 'user-1' });

    expect(gateway.createLoginLink).toHaveBeenCalledWith('acct_123');
    expect(result.url).toBe('https://connect.stripe.com/express/acct');
  });

  it('throws ConnectedAccountNotFoundError without an account', async () => {
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      ConnectedAccountNotFoundError,
    );
  });

  it('throws ConnectedAccountNotReadyError before onboarding is submitted', async () => {
    accounts.findByUserId = async () => buildConnectedAccount({ detailsSubmitted: false });

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      ConnectedAccountNotReadyError,
    );
  });
});
