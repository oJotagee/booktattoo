export const BILLING_GATEWAY = Symbol('BILLING_GATEWAY');

export const BillingWebhookEventKind = {
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_DELETED: 'SUBSCRIPTION_DELETED',
  IGNORED: 'IGNORED',
} as const;

export type BillingWebhookEventKind =
  (typeof BillingWebhookEventKind)[keyof typeof BillingWebhookEventKind];

export type BillingWebhookEvent = {
  id: string;
  type: string;
  kind: BillingWebhookEventKind;
  subscriptionId: string | null;
};

export type SubscriptionSnapshot = {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export type ActiveSubscription = {
  id: string;
  itemId: string;
  priceId: string;
};

export type ChangeSubscriptionPriceParams = {
  subscriptionId: string;
  itemId: string;
  priceId: string;
};

export type CreateCheckoutSessionParams = {
  customerId: string;
  priceId: string;
  userId: string;
};

export interface BillingGateway {
  createCustomer(params: { userId: string; email: string }): Promise<{ id: string }>;
  findActiveSubscription(customerId: string): Promise<ActiveSubscription | null>;
  changeSubscriptionPrice(params: ChangeSubscriptionPriceParams): Promise<void>;
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string }>;
  createPortalSession(customerId: string): Promise<{ url: string }>;
  parseWebhookEvent(rawBody: Buffer, signature: string): Promise<BillingWebhookEvent>;
  retrieveSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
}
