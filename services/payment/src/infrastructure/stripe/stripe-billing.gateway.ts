import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { InvalidWebhookSignatureError } from '@/domain/errors/billing.error';
import stripeConfig from '../config/stripe.config';
import { STRIPE_CLIENT } from './stripe.client';
import {
  type BillingGateway,
  type BillingWebhookEvent,
  BillingWebhookEventKind,
  type CreateCheckoutSessionParams,
  type SubscriptionSnapshot,
} from '@/application/port/billing-gateway.port';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

@Injectable()
export class StripeBillingGateway implements BillingGateway {
  constructor(
    @Inject(STRIPE_CLIENT)
    private readonly stripe: Stripe,
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {}

  async createCustomer({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }): Promise<{ id: string }> {
    const customer = await this.stripe.customers.create(
      { email, metadata: { userId } },
      { idempotencyKey: `billing-customer-${userId}` },
    );

    return { id: customer.id };
  }

  async hasActiveSubscription(customerId: string): Promise<boolean> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    return subscriptions.data.some((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status),
    );
  }

  async createCheckoutSession({
    customerId,
    priceId,
    userId,
  }: CreateCheckoutSessionParams): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { userId } },
      metadata: { userId },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      success_url: this.config.checkoutSuccessUrl,
      cancel_url: this.config.checkoutCancelUrl,
    });

    if (!session.url) throw new Error('Stripe não retornou a URL da Checkout Session.');

    return { url: session.url };
  }

  async createPortalSession(customerId: string): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: this.config.portalReturnUrl,
    });

    return { url: session.url };
  }

  async parseWebhookEvent(rawBody: Buffer, signature: string): Promise<BillingWebhookEvent> {
    let event: Stripe.Event;

    try {
      event = await this.stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        this.config.billingWebhookSecret,
      );
    } catch {
      throw new InvalidWebhookSignatureError();
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscriptionId =
          session.mode === 'subscription' ? this.extractId(session.subscription) : null;

        return {
          id: event.id,
          type: event.type,
          kind: subscriptionId
            ? BillingWebhookEventKind.SUBSCRIPTION_CREATED
            : BillingWebhookEventKind.IGNORED,
          subscriptionId,
        };
      }
      case 'customer.subscription.updated':
        return {
          id: event.id,
          type: event.type,
          kind: BillingWebhookEventKind.SUBSCRIPTION_UPDATED,
          subscriptionId: event.data.object.id,
        };
      case 'customer.subscription.deleted':
        return {
          id: event.id,
          type: event.type,
          kind: BillingWebhookEventKind.SUBSCRIPTION_DELETED,
          subscriptionId: event.data.object.id,
        };
      default:
        return {
          id: event.id,
          type: event.type,
          kind: BillingWebhookEventKind.IGNORED,
          subscriptionId: null,
        };
    }
  }

  async retrieveSubscription(subscriptionId: string): Promise<SubscriptionSnapshot> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];

    return {
      id: subscription.id,
      customerId: this.extractId(subscription.customer) ?? '',
      status: subscription.status,
      priceId: item.price.id,
      currentPeriodEnd: item.current_period_end ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  private extractId(reference: string | { id: string } | null): string | null {
    if (!reference) return null;

    return typeof reference === 'string' ? reference : reference.id;
  }
}
