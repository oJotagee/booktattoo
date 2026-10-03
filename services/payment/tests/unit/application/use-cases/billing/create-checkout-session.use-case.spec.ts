import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateCheckoutSessionUseCase } from '@/application/use-cases/billing/create-checkout-session.use-case';
import { SubscriptionAlreadyActiveError } from '@/domain/errors/billing.error';
import { buildBillingCustomer } from '@tests/unit/support/builders';
import {
  createBillingCustomerRepositoryMock,
  createBillingGatewayMock,
  createPlanCatalogMock,
} from '@tests/unit/support/mocks';

describe('CreateCheckoutSessionUseCase', () => {
  let customers: ReturnType<typeof createBillingCustomerRepositoryMock>;
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let useCase: CreateCheckoutSessionUseCase;

  beforeEach(() => {
    customers = createBillingCustomerRepositoryMock();
    gateway = createBillingGatewayMock();
    useCase = new CreateCheckoutSessionUseCase(customers, gateway, createPlanCatalogMock());
  });

  it('creates the Stripe customer on the first checkout', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      email: 'john.doe@example.com',
      plan: 'BASIC',
    });

    expect(gateway.createCustomer).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'john.doe@example.com',
    });
    expect(customers.create).toHaveBeenCalled();
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith({
      customerId: 'cus_new',
      priceId: 'price_basic',
      userId: 'user-1',
    });
    expect(result.url).toBe('https://checkout.stripe.com/session');
  });

  it('reuses the existing Stripe customer', async () => {
    customers.findByUserId = async () => buildBillingCustomer();

    await useCase.execute({
      userId: 'user-1',
      email: 'john.doe@example.com',
      plan: 'PROFESSIONAL',
    });

    expect(gateway.createCustomer).not.toHaveBeenCalled();
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith({
      customerId: 'cus_123',
      priceId: 'price_professional',
      userId: 'user-1',
    });
  });

  it('throws SubscriptionAlreadyActiveError when the customer already subscribes', async () => {
    customers.findByUserId = async () => buildBillingCustomer();
    gateway.hasActiveSubscription = async () => true;

    await expect(
      useCase.execute({ userId: 'user-1', email: 'john.doe@example.com', plan: 'BASIC' }),
    ).rejects.toThrow(SubscriptionAlreadyActiveError);
    expect(gateway.createCheckoutSession).not.toHaveBeenCalled();
  });
});
