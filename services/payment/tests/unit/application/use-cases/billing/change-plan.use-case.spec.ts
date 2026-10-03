import { beforeEach, describe, expect, it } from 'bun:test';

import { ChangePlanUseCase } from '@/application/use-cases/billing/change-plan.use-case';
import { NoActiveSubscriptionError, PlanAlreadyActiveError } from '@/domain/errors/billing.error';
import { buildBillingCustomer } from '@tests/unit/support/builders';
import {
  createBillingCustomerRepositoryMock,
  createBillingGatewayMock,
  createPlanCatalogMock,
} from '@tests/unit/support/mocks';

const activeBasic = { id: 'sub_123', itemId: 'si_123', priceId: 'price_basic' };

describe('ChangePlanUseCase', () => {
  let customers: ReturnType<typeof createBillingCustomerRepositoryMock>;
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let useCase: ChangePlanUseCase;

  beforeEach(() => {
    customers = createBillingCustomerRepositoryMock();
    gateway = createBillingGatewayMock();
    customers.findByUserId = async () => buildBillingCustomer();
    gateway.findActiveSubscription = async () => activeBasic;
    useCase = new ChangePlanUseCase(customers, gateway, createPlanCatalogMock());
  });

  it('swaps the subscription item to the new plan price', async () => {
    const result = await useCase.execute({ userId: 'user-1', plan: 'PROFESSIONAL' });

    expect(gateway.changeSubscriptionPrice).toHaveBeenCalledWith({
      subscriptionId: 'sub_123',
      itemId: 'si_123',
      priceId: 'price_professional',
    });
    expect(result).toEqual({ plan: 'PROFESSIONAL' });
  });

  it('throws PlanAlreadyActiveError when the plan is the current one', async () => {
    await expect(useCase.execute({ userId: 'user-1', plan: 'BASIC' })).rejects.toThrow(
      PlanAlreadyActiveError,
    );
    expect(gateway.changeSubscriptionPrice).not.toHaveBeenCalled();
  });

  it('throws NoActiveSubscriptionError when the user has no billing customer', async () => {
    customers.findByUserId = async () => null;

    await expect(useCase.execute({ userId: 'user-1', plan: 'PROFESSIONAL' })).rejects.toThrow(
      NoActiveSubscriptionError,
    );
  });

  it('throws NoActiveSubscriptionError when the customer has no active subscription', async () => {
    gateway.findActiveSubscription = async () => null;

    await expect(useCase.execute({ userId: 'user-1', plan: 'PROFESSIONAL' })).rejects.toThrow(
      NoActiveSubscriptionError,
    );
  });
});
