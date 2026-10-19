import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import type { ConnectedAccountStatus } from '@/domain/entities/connected-account.entity';
import type { ConnectGateway } from '@/application/port/connect-gateway.port';
import stripeConfig from '../config/stripe.config';
import { STRIPE_CLIENT } from './stripe.client';

@Injectable()
export class StripeConnectGateway implements ConnectGateway {
  constructor(
    @Inject(STRIPE_CLIENT)
    private readonly stripe: Stripe,
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {}

  async createAccount({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }): Promise<{ id: string }> {
    const account = await this.stripe.accounts.create(
      {
        type: 'express',
        country: 'BR',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { userId },
      },
      { idempotencyKey: `connect-account-${userId}` },
    );

    return { id: account.id };
  }

  async createOnboardingLink(accountId: string): Promise<{ url: string }> {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      return_url: this.config.connectReturnUrl,
      refresh_url: this.config.connectRefreshUrl,
    });

    return { url: link.url };
  }

  async createLoginLink(accountId: string): Promise<{ url: string }> {
    const link = await this.stripe.accounts.createLoginLink(accountId);

    return { url: link.url };
  }

  async retrieveAccountStatus(accountId: string): Promise<ConnectedAccountStatus> {
    const account = await this.stripe.accounts.retrieve(accountId);

    return StripeConnectGateway.toStatus(account);
  }

  static toStatus(account: Stripe.Account): ConnectedAccountStatus {
    return {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    };
  }
}
