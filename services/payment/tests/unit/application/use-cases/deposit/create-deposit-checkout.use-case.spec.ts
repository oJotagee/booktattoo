import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateDepositCheckoutUseCase } from '@/application/use-cases/deposit/create-deposit-checkout.use-case';
import { ConnectedAccountNotReadyError } from '@/domain/errors/billing.error';
import { buildConnectedAccount } from '@tests/unit/support/builders';
import {
  createBillingGatewayMock,
  createConnectedAccountRepositoryMock,
} from '@tests/unit/support/mocks';

const input = {
  appointmentId: 'appointment-1',
  artistId: 'user-1',
  amount: 8000,
  title: 'Rosa Tradicional',
  imageUrl: null,
  customerEmail: 'cliente@email.com',
  successUrl: 'http://localhost:3000/user-1?booking=success',
  cancelUrl: 'http://localhost:3000/user-1?booking=cancelled',
};

describe('CreateDepositCheckoutUseCase', () => {
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let accounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let useCase: CreateDepositCheckoutUseCase;

  beforeEach(() => {
    gateway = createBillingGatewayMock();
    accounts = createConnectedAccountRepositoryMock();
    useCase = new CreateDepositCheckoutUseCase(gateway, accounts);
  });

  it('creates the checkout routed to the artist connected account', async () => {
    accounts.findByUserId = async () => buildConnectedAccount();

    const result = await useCase.execute(input);

    const { artistId: _artistId, ...params } = input;
    expect(gateway.createDepositCheckoutSession).toHaveBeenCalledWith({
      ...params,
      destinationAccountId: 'acct_123',
    });
    expect(result).toEqual({
      checkoutSessionId: 'cs_deposit',
      url: 'https://checkout.stripe.com/deposit',
    });
  });

  it('rejects when the artist has no connected account', async () => {
    await expect(useCase.execute(input)).rejects.toThrow(ConnectedAccountNotReadyError);
    expect(gateway.createDepositCheckoutSession).not.toHaveBeenCalled();
  });

  it('rejects when the connected account cannot receive payments yet', async () => {
    accounts.findByUserId = async () => buildConnectedAccount({ payoutsEnabled: false });

    await expect(useCase.execute(input)).rejects.toThrow(ConnectedAccountNotReadyError);
    expect(gateway.createDepositCheckoutSession).not.toHaveBeenCalled();
  });
});
