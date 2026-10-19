import { beforeEach, describe, expect, it } from 'bun:test';

import { StartConnectOnboardingUseCase } from '@/application/use-cases/connect/start-connect-onboarding.use-case';
import { buildConnectedAccount } from '@tests/unit/support/builders';
import {
  createConnectedAccountRepositoryMock,
  createConnectGatewayMock,
} from '@tests/unit/support/mocks';

describe('StartConnectOnboardingUseCase', () => {
  let accounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let gateway: ReturnType<typeof createConnectGatewayMock>;
  let useCase: StartConnectOnboardingUseCase;

  beforeEach(() => {
    accounts = createConnectedAccountRepositoryMock();
    gateway = createConnectGatewayMock();
    useCase = new StartConnectOnboardingUseCase(accounts, gateway);
  });

  it('creates the express account on first access and returns the onboarding link', async () => {
    const result = await useCase.execute({ userId: 'user-1', email: 'artist@email.com' });

    expect(gateway.createAccount).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'artist@email.com',
    });
    expect(accounts.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', stripeAccountId: 'acct_new' }),
    );
    expect(gateway.createOnboardingLink).toHaveBeenCalledWith('acct_new');
    expect(result.url).toBe('https://connect.stripe.com/setup/e/acct');
  });

  it('reuses the existing account', async () => {
    accounts.findByUserId = async () => buildConnectedAccount({ detailsSubmitted: false });

    await useCase.execute({ userId: 'user-1', email: 'artist@email.com' });

    expect(gateway.createAccount).not.toHaveBeenCalled();
    expect(accounts.save).not.toHaveBeenCalled();
    expect(gateway.createOnboardingLink).toHaveBeenCalledWith('acct_123');
  });
});
