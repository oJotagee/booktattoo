import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import { BillingWebhookEventKind } from '@/application/port/billing-gateway.port';
import { buildBillingCustomer } from '@tests/unit/support/builders';
import {
  createBillingCustomerRepositoryMock,
  createBillingGatewayMock,
  createEventPublisherMock,
  createPlanCatalogMock,
  createProcessedWebhookEventRepositoryMock,
} from '@tests/unit/support/mocks';

const input = { rawBody: Buffer.from('{}'), signature: 't=1,v1=abc' };

describe('HandleBillingWebhookUseCase', () => {
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let customers: ReturnType<typeof createBillingCustomerRepositoryMock>;
  let processedEvents: ReturnType<typeof createProcessedWebhookEventRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: HandleBillingWebhookUseCase;

  beforeEach(() => {
    gateway = createBillingGatewayMock();
    customers = createBillingCustomerRepositoryMock();
    processedEvents = createProcessedWebhookEventRepositoryMock();
    publisher = createEventPublisherMock();
    customers.findByStripeCustomerId = async () => buildBillingCustomer();
    useCase = new HandleBillingWebhookUseCase(
      gateway,
      customers,
      processedEvents,
      createPlanCatalogMock(),
      publisher,
    );
  });

  it('publishes the subscription state and marks the event as processed', async () => {
    await useCase.execute(input);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_1',
        type: 'payment.subscription.updated',
        version: 1,
        correlationId: 'sub_123',
        payload: {
          userId: 'user-1',
          stripeSubscriptionId: 'sub_123',
          status: 'active',
          plan: 'BASIC',
          priceId: 'price_basic',
          currentPeriodEnd: '2026-11-01T00:00:00.000Z',
          cancelAtPeriodEnd: false,
        },
      }),
    );
    expect(processedEvents.save).toHaveBeenCalledWith('evt_1', 'customer.subscription.updated');
  });

  it('maps checkout completion to an activation event', async () => {
    gateway.parseWebhookEvent = async () => ({
      id: 'evt_2',
      type: 'checkout.session.completed',
      kind: BillingWebhookEventKind.SUBSCRIPTION_CREATED,
      subscriptionId: 'sub_123',
    });

    await useCase.execute(input);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment.subscription.activated' }),
    );
  });

  it('skips events already processed', async () => {
    processedEvents.exists = async () => true;

    await useCase.execute(input);

    expect(gateway.retrieveSubscription).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(processedEvents.save).not.toHaveBeenCalled();
  });

  it('only records events it does not handle', async () => {
    gateway.parseWebhookEvent = async () => ({
      id: 'evt_3',
      type: 'invoice.paid',
      kind: BillingWebhookEventKind.IGNORED,
      subscriptionId: null,
    });

    await useCase.execute(input);

    expect(publisher.publish).not.toHaveBeenCalled();
    expect(processedEvents.save).toHaveBeenCalledWith('evt_3', 'invoice.paid');
  });

  it('does not mark the event as processed when publishing fails', async () => {
    publisher.publish = mock(async () => {
      throw new Error('broker down');
    });

    await expect(useCase.execute(input)).rejects.toThrow('broker down');
    expect(processedEvents.save).not.toHaveBeenCalled();
  });
});
