import type { EventPublisher } from '@bookink/shared/events';
import { mock } from 'bun:test';

import type { ProcessedWebhookEventRepository } from '@/application/port/processed-webhook-event-repository.port';
import type { BillingCustomerRepository } from '@/application/port/billing-customer-repository.port';
import type { ActiveSubscription, BillingGateway } from '@/application/port/billing-gateway.port';
import { BillingWebhookEventKind } from '@/application/port/billing-gateway.port';
import type { PlanCatalog } from '@/application/port/plan-catalog.port';
import type { ConnectedAccountRepository } from '@/application/port/connected-account-repository.port';
import type { ConnectGateway } from '@/application/port/connect-gateway.port';

export function createBillingCustomerRepositoryMock(): BillingCustomerRepository {
  return {
    findByUserId: mock(async () => null),
    findByStripeCustomerId: mock(async () => null),
    create: mock(async () => undefined),
  };
}

export function createProcessedWebhookEventRepositoryMock(): ProcessedWebhookEventRepository {
  return {
    exists: mock(async () => false),
    save: mock(async () => undefined),
  };
}

export function createBillingGatewayMock(): BillingGateway {
  return {
    createCustomer: mock(async () => ({ id: 'cus_new' })),
    findActiveSubscription: mock(async (): Promise<ActiveSubscription | null> => null),
    changeSubscriptionPrice: mock(async () => undefined),
    createCheckoutSession: mock(async () => ({ url: 'https://checkout.stripe.com/session' })),
    createPortalSession: mock(async () => ({ url: 'https://billing.stripe.com/portal' })),
    createDepositCheckoutSession: mock(async () => ({
      id: 'cs_deposit',
      url: 'https://checkout.stripe.com/deposit',
    })),
    parseWebhookEvent: mock(async () => ({
      id: 'evt_1',
      type: 'customer.subscription.updated',
      kind: BillingWebhookEventKind.SUBSCRIPTION_UPDATED,
      subscriptionId: 'sub_123',
    })),
    retrieveSubscription: mock(async () => ({
      id: 'sub_123',
      customerId: 'cus_123',
      status: 'active',
      priceId: 'price_basic',
      currentPeriodEnd: new Date('2026-11-01T00:00:00.000Z'),
      cancelAtPeriodEnd: false,
    })),
    refundDeposit: mock(async () => ({ refundId: 're_123' })),
    expireDepositCheckout: mock(async () => undefined),
  };
}

export function createPlanCatalogMock(): PlanCatalog {
  return {
    priceIdFor: mock((plan: string) => (plan === 'BASIC' ? 'price_basic' : 'price_professional')),
    planFor: mock(() => 'BASIC' as const),
  };
}

export function createEventPublisherMock(): EventPublisher {
  return {
    publish: mock(async () => undefined),
  };
}

export function createConnectedAccountRepositoryMock(): ConnectedAccountRepository {
  return {
    findByUserId: mock(async () => null),
    findByStripeAccountId: mock(async () => null),
    save: mock(async () => undefined),
  };
}

export function createConnectGatewayMock(): ConnectGateway {
  return {
    createAccount: mock(async () => ({ id: 'acct_new' })),
    createOnboardingLink: mock(async () => ({ url: 'https://connect.stripe.com/setup/e/acct' })),
    createLoginLink: mock(async () => ({ url: 'https://connect.stripe.com/express/acct' })),
    retrieveAccount: mock(async () => ({
      status: { chargesEnabled: true, payoutsEnabled: true, detailsSubmitted: true },
      pendingRequirements: [],
    })),
  };
}
