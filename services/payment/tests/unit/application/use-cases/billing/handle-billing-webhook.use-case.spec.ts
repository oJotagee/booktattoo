import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import { SyncConnectedAccountUseCase } from '@/application/use-cases/connect/sync-connected-account.use-case';
import { BillingWebhookEventKind } from '@/application/port/billing-gateway.port';
import { buildBillingCustomer, buildConnectedAccount } from '@tests/unit/support/builders';
import {
  createBillingCustomerRepositoryMock,
  createBillingGatewayMock,
  createConnectedAccountRepositoryMock,
  createConnectGatewayMock,
  createEventPublisherMock,
  createPlanCatalogMock,
  createProcessedWebhookEventRepositoryMock,
} from '@tests/unit/support/mocks';

const input = { rawBody: Buffer.from('{}'), signature: 't=1,v1=abc', source: 'platform' as const };

const ACCOUNT_EVENT_TYPE = 'v2.core.account[configuration.merchant].capability_status_updated';

const accountUpdatedEvent = {
  id: 'evt_acct',
  type: ACCOUNT_EVENT_TYPE,
  kind: BillingWebhookEventKind.ACCOUNT_UPDATED,
  subscriptionId: null,
  account: { id: 'acct_123' },
};

describe('HandleBillingWebhookUseCase', () => {
  let gateway: ReturnType<typeof createBillingGatewayMock>;
  let customers: ReturnType<typeof createBillingCustomerRepositoryMock>;
  let processedEvents: ReturnType<typeof createProcessedWebhookEventRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let connectedAccounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let connectGateway: ReturnType<typeof createConnectGatewayMock>;
  let useCase: HandleBillingWebhookUseCase;

  beforeEach(() => {
    gateway = createBillingGatewayMock();
    customers = createBillingCustomerRepositoryMock();
    processedEvents = createProcessedWebhookEventRepositoryMock();
    publisher = createEventPublisherMock();
    connectedAccounts = createConnectedAccountRepositoryMock();
    connectGateway = createConnectGatewayMock();
    customers.findByStripeCustomerId = async () => buildBillingCustomer();
    useCase = new HandleBillingWebhookUseCase(
      gateway,
      customers,
      processedEvents,
      createPlanCatalogMock(),
      publisher,
      connectedAccounts,
      new SyncConnectedAccountUseCase(connectedAccounts, publisher),
      connectGateway,
    );
  });

  it('verifies the signature with the source of the endpoint', async () => {
    await useCase.execute({ ...input, source: 'connect' });

    expect(gateway.parseWebhookEvent).toHaveBeenCalledWith(
      input.rawBody,
      input.signature,
      'connect',
    );
  });

  it('fetches the current account status from Stripe and syncs it', async () => {
    gateway.parseWebhookEvent = async () => accountUpdatedEvent;
    connectedAccounts.findByStripeAccountId = async () =>
      buildConnectedAccount({ chargesEnabled: false, payoutsEnabled: false });

    await useCase.execute({ ...input, source: 'connect' });

    expect(connectGateway.retrieveAccount).toHaveBeenCalledWith('acct_123');
    expect(connectedAccounts.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentsEnabled: true }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_acct',
        type: 'payment.connect.account.updated',
        payload: expect.objectContaining({ userId: 'user-1', paymentsEnabled: true }),
      }),
    );
    expect(processedEvents.save).toHaveBeenCalledWith('evt_acct', ACCOUNT_EVENT_TYPE);
  });

  it('records account events for unknown accounts without publishing', async () => {
    gateway.parseWebhookEvent = async () => accountUpdatedEvent;

    await useCase.execute({ ...input, source: 'connect' });

    expect(publisher.publish).not.toHaveBeenCalled();
    expect(processedEvents.save).toHaveBeenCalledWith('evt_acct', ACCOUNT_EVENT_TYPE);
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

  it('publishes a paid deposit without looking up subscriptions', async () => {
    gateway.parseWebhookEvent = async () => ({
      id: 'evt_4',
      type: 'checkout.session.completed',
      kind: BillingWebhookEventKind.DEPOSIT_PAID,
      subscriptionId: null,
      deposit: { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', amount: 8000 },
    });

    await useCase.execute(input);

    expect(gateway.retrieveSubscription).not.toHaveBeenCalled();
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_4',
        type: 'payment.deposit.paid',
        correlationId: 'appointment-1',
        payload: { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', amount: 8000 },
      }),
    );
    expect(processedEvents.save).toHaveBeenCalledWith('evt_4', 'checkout.session.completed');
  });

  it('publishes an expired deposit', async () => {
    gateway.parseWebhookEvent = async () => ({
      id: 'evt_5',
      type: 'checkout.session.expired',
      kind: BillingWebhookEventKind.DEPOSIT_EXPIRED,
      subscriptionId: null,
      deposit: { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', amount: 8000 },
    });

    await useCase.execute(input);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment.deposit.expired' }),
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
