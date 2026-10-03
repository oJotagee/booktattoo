import type { EventPublisher } from '@bookink/shared/events';
import { mock } from 'bun:test';

import type { ProcessedWebhookEventRepository } from '@/application/port/processed-webhook-event-repository.port';
import type { BillingCustomerRepository } from '@/application/port/billing-customer-repository.port';
import type { BillingGateway } from '@/application/port/billing-gateway.port';
import { BillingWebhookEventKind } from '@/application/port/billing-gateway.port';
import type { PlanCatalog } from '@/application/port/plan-catalog.port';

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
    hasActiveSubscription: mock(async () => false),
    createCheckoutSession: mock(async () => ({ url: 'https://checkout.stripe.com/session' })),
    createPortalSession: mock(async () => ({ url: 'https://billing.stripe.com/portal' })),
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
