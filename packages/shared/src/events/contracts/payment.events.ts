import type { EventEnvelope } from '../event-envelope';

export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL';

export type SubscriptionChangedPayload = {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  plan: SubscriptionPlan;
  priceId: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type PaymentSubscriptionActivated = EventEnvelope<
  'payment.subscription.activated',
  SubscriptionChangedPayload
>;

export type PaymentSubscriptionUpdated = EventEnvelope<
  'payment.subscription.updated',
  SubscriptionChangedPayload
>;

export type PaymentSubscriptionCanceled = EventEnvelope<
  'payment.subscription.canceled',
  SubscriptionChangedPayload
>;

export type PaymentSubscriptionEvent =
  | PaymentSubscriptionActivated
  | PaymentSubscriptionUpdated
  | PaymentSubscriptionCanceled;

export type PaymentSubscriptionEventType = PaymentSubscriptionEvent['type'];
