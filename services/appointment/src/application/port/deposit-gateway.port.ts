export const DEPOSIT_GATEWAY = Symbol('DEPOSIT_GATEWAY');

export type CreateDepositCheckoutParams = {
  appointmentId: string;
  artistId: string;
  amount: number;
  title: string;
  imageUrl: string | null;
  customerEmail: string;
};

export type DepositCheckout = {
  checkoutSessionId: string;
  url: string;
};

export type RefundDepositParams = {
  appointmentId: string;
  checkoutSessionId: string;
};

export interface DepositGateway {
  create(params: CreateDepositCheckoutParams): Promise<DepositCheckout>;
  refund(params: RefundDepositParams): Promise<{ refundId: string }>;
  expireCheckout(checkoutSessionId: string): Promise<void>;
}
