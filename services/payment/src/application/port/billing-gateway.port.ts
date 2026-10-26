export const BILLING_GATEWAY = Symbol('BILLING_GATEWAY');

export type WebhookSource = 'platform' | 'connect';

export const BillingWebhookEventKind = {
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_DELETED: 'SUBSCRIPTION_DELETED',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  DEPOSIT_EXPIRED: 'DEPOSIT_EXPIRED',
  ACCOUNT_UPDATED: 'ACCOUNT_UPDATED',
  IGNORED: 'IGNORED',
} as const;

export type BillingWebhookEventKind =
  (typeof BillingWebhookEventKind)[keyof typeof BillingWebhookEventKind];

export type BillingWebhookEvent = {
  id: string;
  type: string;
  kind: BillingWebhookEventKind;
  subscriptionId: string | null;
  deposit?: DepositSnapshot | null;
  account?: ConnectedAccountSnapshot | null;
};

export type DepositSnapshot = {
  appointmentId: string;
  checkoutSessionId: string;
  amount: number | null;
  currency: string | null;
};

export type ConnectedAccountSnapshot = {
  id: string;
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

export type CreateDepositCheckoutSessionParams = {
  destinationAccountId: string;
  appointmentId: string;
  amount: number;
  title: string;
  imageUrl: string | null;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export type RefundDepositParams = {
  appointmentId: string;
  checkoutSessionId: string;
};

export interface BillingGateway {
  createCustomer(params: { userId: string; email: string }): Promise<{ id: string }>;
  findActiveSubscription(customerId: string): Promise<ActiveSubscription | null>;
  changeSubscriptionPrice(params: ChangeSubscriptionPriceParams): Promise<void>;
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string }>;
  createPortalSession(customerId: string): Promise<{ url: string }>;
  createDepositCheckoutSession(
    params: CreateDepositCheckoutSessionParams,
  ): Promise<{ id: string; url: string }>;
  parseWebhookEvent(
    rawBody: Buffer,
    signature: string,
    source: WebhookSource,
  ): Promise<BillingWebhookEvent>;
  retrieveSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
  refundDeposit(params: RefundDepositParams): Promise<{ refundId: string }>;
  expireDepositCheckout(checkoutSessionId: string): Promise<void>;
}
