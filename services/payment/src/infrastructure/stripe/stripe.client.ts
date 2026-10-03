import type { ConfigType } from '@nestjs/config';
import type { Provider } from '@nestjs/common';
import Stripe from 'stripe';

import stripeConfig from '../config/stripe.config';

export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

export const StripeClientProvider: Provider = {
  provide: STRIPE_CLIENT,
  inject: [stripeConfig.KEY],
  useFactory: (config: ConfigType<typeof stripeConfig>) => new Stripe(config.secretKey),
};
