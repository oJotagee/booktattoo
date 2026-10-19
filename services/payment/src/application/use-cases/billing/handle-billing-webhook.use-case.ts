import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  createEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
  type PaymentDepositEventType,
  type PaymentSubscriptionEventType,
  type SubscriptionChangedPayload,
} from '@bookink/shared/events';

import type { ProcessedWebhookEventRepository } from '../../port/processed-webhook-event-repository.port';
import { PROCESSED_WEBHOOK_EVENT_REPOSITORY } from '../../port/processed-webhook-event-repository.port';
import type { BillingCustomerRepository } from '../../port/billing-customer-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from '../../port/billing-customer-repository.port';
import type { PlanCatalog } from '../../port/plan-catalog.port';
import { SyncConnectedAccountUseCase } from '../connect/sync-connected-account.use-case';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';
import { PLAN_CATALOG } from '../../port/plan-catalog.port';
import {
  BILLING_GATEWAY,
  type BillingGateway,
  type BillingWebhookEvent,
  BillingWebhookEventKind,
  type WebhookSource,
} from '../../port/billing-gateway.port';

type HandleBillingWebhookInput = {
  rawBody: Buffer;
  signature: string;
  source: WebhookSource;
};

const EVENT_TYPE_BY_KIND: Partial<Record<BillingWebhookEventKind, PaymentSubscriptionEventType>> = {
  [BillingWebhookEventKind.SUBSCRIPTION_CREATED]: 'payment.subscription.activated',
  [BillingWebhookEventKind.SUBSCRIPTION_UPDATED]: 'payment.subscription.updated',
  [BillingWebhookEventKind.SUBSCRIPTION_DELETED]: 'payment.subscription.canceled',
};

const DEPOSIT_EVENT_TYPE_BY_KIND: Partial<
  Record<BillingWebhookEventKind, PaymentDepositEventType>
> = {
  [BillingWebhookEventKind.DEPOSIT_PAID]: 'payment.deposit.paid',
  [BillingWebhookEventKind.DEPOSIT_EXPIRED]: 'payment.deposit.expired',
};

@Injectable()
export class HandleBillingWebhookUseCase {
  private readonly logger = new Logger(HandleBillingWebhookUseCase.name);

  constructor(
    @Inject(BILLING_GATEWAY)
    private readonly gateway: BillingGateway,
    @Inject(BILLING_CUSTOMER_REPOSITORY)
    private readonly customers: BillingCustomerRepository,
    @Inject(PROCESSED_WEBHOOK_EVENT_REPOSITORY)
    private readonly processedEvents: ProcessedWebhookEventRepository,
    @Inject(PLAN_CATALOG)
    private readonly plans: PlanCatalog,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly connectedAccounts: ConnectedAccountRepository,
    private readonly syncConnectedAccount: SyncConnectedAccountUseCase,
  ) {}

  async execute({ rawBody, signature, source }: HandleBillingWebhookInput): Promise<void> {
    const webhookEvent = await this.gateway.parseWebhookEvent(rawBody, signature, source);

    if (await this.processedEvents.exists(webhookEvent.id)) return;

    const eventType = EVENT_TYPE_BY_KIND[webhookEvent.kind];

    if (eventType && webhookEvent.subscriptionId) {
      await this.publishSubscriptionChange(webhookEvent.id, eventType, webhookEvent.subscriptionId);
    }

    const depositEventType = DEPOSIT_EVENT_TYPE_BY_KIND[webhookEvent.kind];

    if (depositEventType && webhookEvent.deposit) {
      await this.publisher.publish(
        createEventEnvelope(depositEventType, webhookEvent.deposit, {
          eventId: webhookEvent.id,
          correlationId: webhookEvent.deposit.appointmentId,
        }),
      );
    }

    if (webhookEvent.kind === BillingWebhookEventKind.ACCOUNT_UPDATED) {
      await this.syncAccount(webhookEvent);
    }

    await this.processedEvents.save(webhookEvent.id, webhookEvent.type);
  }

  private async syncAccount({ id, account: snapshot }: BillingWebhookEvent): Promise<void> {
    if (!snapshot) return;

    const account = await this.connectedAccounts.findByStripeAccountId(snapshot.id);
    if (!account) {
      this.logger.warn(`Conta conectada ${snapshot.id} não está cadastrada`);
      return;
    }

    const { id: _stripeAccountId, ...status } = snapshot;

    await this.syncConnectedAccount.execute({ account, status, eventId: id });
  }

  private async publishSubscriptionChange(
    webhookEventId: string,
    eventType: PaymentSubscriptionEventType,
    subscriptionId: string,
  ): Promise<void> {
    const subscription = await this.gateway.retrieveSubscription(subscriptionId);

    const customer = await this.customers.findByStripeCustomerId(subscription.customerId);
    if (!customer) {
      this.logger.warn(
        `Assinatura ${subscription.id} pertence ao customer ${subscription.customerId}, que não está cadastrado`,
      );
      return;
    }

    const payload: SubscriptionChangedPayload = {
      userId: customer.userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      plan: this.plans.planFor(subscription.priceId),
      priceId: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };

    await this.publisher.publish(
      createEventEnvelope(eventType, payload, {
        eventId: webhookEventId,
        correlationId: subscription.id,
      }),
    );
  }
}
