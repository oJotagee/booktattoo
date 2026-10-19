import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { InvalidWebhookSignatureError } from '@/domain/errors/billing.error';
import stripeConfig from '../config/stripe.config';
import { STRIPE_CLIENT } from './stripe.client';
import {
  type ActiveSubscription,
  type BillingGateway,
  type BillingWebhookEvent,
  BillingWebhookEventKind,
  type ChangeSubscriptionPriceParams,
  type CreateCheckoutSessionParams,
  type CreateDepositCheckoutSessionParams,
  type SubscriptionSnapshot,
  type WebhookSource,
} from '@/application/port/billing-gateway.port';
import { StripeConnectGateway } from './stripe-connect.gateway';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

// O Stripe exige no mínimo 30 minutos; a folga cobre o atraso entre o cálculo e a chamada
const DEPOSIT_CHECKOUT_TTL_SECONDS = 31 * 60;

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

  async findActiveSubscription(customerId: string): Promise<ActiveSubscription | null> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    const subscription = subscriptions.data.find(({ status }) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(status),
    );
    if (!subscription) return null;

    const item = subscription.items.data[0];

    return { id: subscription.id, itemId: item.id, priceId: item.price.id };
  }

  async changeSubscriptionPrice({
    subscriptionId,
    itemId,
    priceId,
  }: ChangeSubscriptionPriceParams): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'create_prorations',
      cancel_at_period_end: false,
    });
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

  async createDepositCheckoutSession({
    appointmentId,
    amount,
    title,
    imageUrl,
    customerEmail,
    successUrl,
    cancelUrl,
  }: CreateDepositCheckoutSessionParams): Promise<{ id: string; url: string }> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: customerEmail,
        client_reference_id: appointmentId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'brl',
              unit_amount: amount,
              product_data: {
                name: `Sinal — ${title}`,
                ...(imageUrl && { images: [imageUrl] }),
              },
            },
          },
        ],
        metadata: { appointmentId },
        payment_intent_data: { metadata: { appointmentId } },
        expires_at: Math.floor(Date.now() / 1000) + DEPOSIT_CHECKOUT_TTL_SECONDS,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      { idempotencyKey: `deposit-checkout-${appointmentId}` },
    );

    if (!session.url) throw new Error('Stripe não retornou a URL da Checkout Session.');

    return { id: session.id, url: session.url };
  }

  async parseWebhookEvent(
    rawBody: Buffer,
    signature: string,
    source: WebhookSource,
  ): Promise<BillingWebhookEvent> {
    let event: Stripe.Event;

    try {
      event = await this.stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        source === 'connect' ? this.config.connectWebhookSecret : this.config.billingWebhookSecret,
      );
    } catch {
      throw new InvalidWebhookSignatureError();
    }

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;

        return {
          id: event.id,
          type: event.type,
          kind: BillingWebhookEventKind.ACCOUNT_UPDATED,
          subscriptionId: null,
          account: { id: account.id, ...StripeConnectGateway.toStatus(account) },
        };
      }
      case 'checkout.session.completed': {
        const session = event.data.object;

        if (session.mode === 'payment') {
          return this.toDepositEvent(
            event,
            session,
            session.payment_status === 'paid'
              ? BillingWebhookEventKind.DEPOSIT_PAID
              : BillingWebhookEventKind.IGNORED,
          );
        }

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
      case 'checkout.session.expired': {
        const session = event.data.object;

        return session.mode === 'payment'
          ? this.toDepositEvent(event, session, BillingWebhookEventKind.DEPOSIT_EXPIRED)
          : {
              id: event.id,
              type: event.type,
              kind: BillingWebhookEventKind.IGNORED,
              subscriptionId: null,
            };
      }
      case 'customer.subscription.created':
        return {
          id: event.id,
          type: event.type,
          kind: BillingWebhookEventKind.SUBSCRIPTION_CREATED,
          subscriptionId: event.data.object.id,
        };
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

  private toDepositEvent(
    event: Stripe.Event,
    session: Stripe.Checkout.Session,
    kind: BillingWebhookEventKind,
  ): BillingWebhookEvent {
    const appointmentId = session.metadata?.appointmentId;

    if (!appointmentId) {
      return {
        id: event.id,
        type: event.type,
        kind: BillingWebhookEventKind.IGNORED,
        subscriptionId: null,
      };
    }

    return {
      id: event.id,
      type: event.type,
      kind,
      subscriptionId: null,
      deposit: { appointmentId, checkoutSessionId: session.id, amount: session.amount_total },
    };
  }

  private extractId(reference: string | { id: string } | null): string | null {
    if (!reference) return null;

    return typeof reference === 'string' ? reference : reference.id;
  }
}
