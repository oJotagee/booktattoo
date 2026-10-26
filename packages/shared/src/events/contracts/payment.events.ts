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

export type DepositChangedPayload = {
  appointmentId: string;
  checkoutSessionId: string;
  amount: number | null;
  currency: string | null;
};

export type PaymentDepositPaid = EventEnvelope<'payment.deposit.paid', DepositChangedPayload>;

export type PaymentDepositExpired = EventEnvelope<'payment.deposit.expired', DepositChangedPayload>;

export type PaymentDepositEvent = PaymentDepositPaid | PaymentDepositExpired;

export type PaymentDepositEventType = PaymentDepositEvent['type'];

export type ConnectAccountUpdatedPayload = {
  userId: string;
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  paymentsEnabled: boolean;
};

export type PaymentConnectAccountUpdated = EventEnvelope<
  'payment.connect.account.updated',
  ConnectAccountUpdatedPayload
>;

export type PaymentConnectEvent = PaymentConnectAccountUpdated;

export type PaymentConnectEventType = PaymentConnectEvent['type'];
