import { describe, expect, it } from 'bun:test';

import { CreateDepositCheckoutUseCase } from '@/application/use-cases/deposit/create-deposit-checkout.use-case';
import { createBillingGatewayMock } from '@tests/unit/support/mocks';

describe('CreateDepositCheckoutUseCase', () => {
  it('creates a deposit checkout session and returns its id and url', async () => {
    const gateway = createBillingGatewayMock();
    const useCase = new CreateDepositCheckoutUseCase(gateway);
    const input = {
      appointmentId: 'appointment-1',
      amount: 8000,
      title: 'Rosa Tradicional',
      imageUrl: null,
      customerEmail: 'cliente@email.com',
      successUrl: 'http://localhost:3000/user-1?booking=success',
      cancelUrl: 'http://localhost:3000/user-1?booking=cancelled',
    };

    const result = await useCase.execute(input);

    expect(gateway.createDepositCheckoutSession).toHaveBeenCalledWith(input);
    expect(result).toEqual({
      checkoutSessionId: 'cs_deposit',
      url: 'https://checkout.stripe.com/deposit',
    });
  });
});
