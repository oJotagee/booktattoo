import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  billingWebhookSecret: process.env.STRIPE_BILLING_WEBHOOK_SECRET ?? '',
  prices: {
    BASIC: process.env.STRIPE_PRICE_BASIC ?? '',
    PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
  },
  checkoutSuccessUrl: process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? '',
  checkoutCancelUrl: process.env.STRIPE_CHECKOUT_CANCEL_URL ?? '',
  portalReturnUrl: process.env.STRIPE_PORTAL_RETURN_URL ?? '',
}));
