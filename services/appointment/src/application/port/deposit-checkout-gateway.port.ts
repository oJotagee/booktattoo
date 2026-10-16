export const DEPOSIT_CHECKOUT_GATEWAY = Symbol('DEPOSIT_CHECKOUT_GATEWAY');

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

export interface DepositCheckoutGateway {
  create(params: CreateDepositCheckoutParams): Promise<DepositCheckout>;
}
