import { describe, expect, it } from 'bun:test';

import { ExpireDepositCheckoutUseCase } from '@/application/use-cases/deposit/expire-deposit-checkout.use-case';
import { RefundDepositUseCase } from '@/application/use-cases/deposit/refund-deposit.use-case';
import { createBillingGatewayMock } from '@tests/unit/support/mocks';

describe('RefundDepositUseCase', () => {
  it('refunds the deposit paid in the checkout session', async () => {
    const gateway = createBillingGatewayMock();
    const input = { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1' };

    const result = await new RefundDepositUseCase(gateway).execute(input);

    expect(gateway.refundDeposit).toHaveBeenCalledWith(input);
    expect(result).toEqual({ refundId: 're_123' });
  });
});

describe('ExpireDepositCheckoutUseCase', () => {
  it('expires the checkout session', async () => {
    const gateway = createBillingGatewayMock();

    await new ExpireDepositCheckoutUseCase(gateway).execute({ checkoutSessionId: 'cs_1' });

    expect(gateway.expireDepositCheckout).toHaveBeenCalledWith('cs_1');
  });
});
