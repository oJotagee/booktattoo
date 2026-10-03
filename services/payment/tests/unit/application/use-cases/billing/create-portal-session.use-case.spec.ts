import { beforeEach, describe, expect, it } from 'bun:test';

import { CreatePortalSessionUseCase } from '@/application/use-cases/billing/create-portal-session.use-case';
import { BillingCustomerNotFoundError } from '@/domain/errors/billing.error';
import { buildBillingCustomer } from '@tests/unit/support/builders';
import {
  createBillingCustomerRepositoryMock,
  createBillingGatewayMock,
} from '@tests/unit/support/mocks';

describe('CreatePortalSessionUseCase', () => {
  let customers: ReturnType<typeof createBillingCustomerRepositoryMock>;
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let useCase: CreatePortalSessionUseCase;

  beforeEach(() => {
    customers = createBillingCustomerRepositoryMock();
    gateway = createBillingGatewayMock();
    useCase = new CreatePortalSessionUseCase(customers, gateway);
  });

  it('returns the portal url for the customer', async () => {
    customers.findByUserId = async () => buildBillingCustomer();

    const result = await useCase.execute({ userId: 'user-1' });

    expect(gateway.createPortalSession).toHaveBeenCalledWith('cus_123');
    expect(result.url).toBe('https://billing.stripe.com/portal');
  });

  it('throws BillingCustomerNotFoundError when the user never subscribed', async () => {
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      BillingCustomerNotFoundError,
    );
  });
});
