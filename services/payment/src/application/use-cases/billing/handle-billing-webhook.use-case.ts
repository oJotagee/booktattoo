import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  createEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
  type PaymentSubscriptionEventType,
  type SubscriptionChangedPayload,
} from '@bookink/shared/events';

import type { ProcessedWebhookEventRepository } from '../../port/processed-webhook-event-repository.port';
import { PROCESSED_WEBHOOK_EVENT_REPOSITORY } from '../../port/processed-webhook-event-repository.port';
import type { BillingCustomerRepository } from '../../port/billing-customer-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from '../../port/billing-customer-repository.port';
import type { PlanCatalog } from '../../port/plan-catalog.port';
import { PLAN_CATALOG } from '../../port/plan-catalog.port';
import {
  BILLING_GATEWAY,
  type BillingGateway,
  BillingWebhookEventKind,
} from '../../port/billing-gateway.port';

type HandleBillingWebhookInput = {
  rawBody: Buffer;
  signature: string;
};

const EVENT_TYPE_BY_KIND: Partial<Record<BillingWebhookEventKind, PaymentSubscriptionEventType>> = {
  [BillingWebhookEventKind.SUBSCRIPTION_CREATED]: 'payment.subscription.activated',
  [BillingWebhookEventKind.SUBSCRIPTION_UPDATED]: 'payment.subscription.updated',
  [BillingWebhookEventKind.SUBSCRIPTION_DELETED]: 'payment.subscription.canceled',
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
  ) {}

  async execute({ rawBody, signature }: HandleBillingWebhookInput): Promise<void> {
    const webhookEvent = await this.gateway.parseWebhookEvent(rawBody, signature);

    if (await this.processedEvents.exists(webhookEvent.id)) return;

    const eventType = EVENT_TYPE_BY_KIND[webhookEvent.kind];

    if (eventType && webhookEvent.subscriptionId) {
      await this.publishSubscriptionChange(webhookEvent.id, eventType, webhookEvent.subscriptionId);
    }

    await this.processedEvents.save(webhookEvent.id, webhookEvent.type);
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
