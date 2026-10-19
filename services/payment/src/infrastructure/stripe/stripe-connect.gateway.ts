import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import type { ConnectedAccountStatus } from '@/domain/entities/connected-account.entity';
import type { ConnectGateway } from '@/application/port/connect-gateway.port';
import stripeConfig from '../config/stripe.config';
import { STRIPE_CLIENT } from './stripe.client';

type V2Account = Awaited<ReturnType<Stripe['v2']['core']['accounts']['retrieve']>>;

const ACTIVE = 'active';
const BLOCKING_DEADLINES = new Set(['currently_due', 'past_due']);

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
    const account = await this.stripe.v2.core.accounts.create(
      {
        contact_email: email,
        dashboard: 'express',
        identity: { country: 'br' },
        defaults: {
          currency: 'brl',
          responsibilities: { fees_collector: 'application', losses_collector: 'application' },
        },
        configuration: {
          merchant: { capabilities: { card_payments: { requested: true } } },
          recipient: {
            capabilities: { stripe_balance: { stripe_transfers: { requested: true } } },
          },
        },
        metadata: { userId },
      },
      { idempotencyKey: `connect-account-${userId}` },
    );

    return { id: account.id };
  }

  async createOnboardingLink(accountId: string): Promise<{ url: string }> {
    const link = await this.stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['merchant', 'recipient'],
          return_url: this.config.connectReturnUrl,
          refresh_url: this.config.connectRefreshUrl,
        },
      },
    });

    return { url: link.url };
  }

  async createLoginLink(accountId: string): Promise<{ url: string }> {
    const link = await this.stripe.accounts.createLoginLink(accountId);

    return { url: link.url };
  }

  async retrieveAccountStatus(accountId: string): Promise<ConnectedAccountStatus> {
    const account = await this.stripe.v2.core.accounts.retrieve(accountId, {
      include: ['configuration.merchant', 'configuration.recipient', 'requirements'],
    });

    return StripeConnectGateway.toStatus(account);
  }

  static toStatus({ configuration, requirements }: V2Account): ConnectedAccountStatus {
    const merchant = configuration?.merchant?.capabilities;
    const recipient = configuration?.recipient?.capabilities;

    return {
      chargesEnabled:
        merchant?.card_payments?.status === ACTIVE &&
        recipient?.stripe_balance?.stripe_transfers?.status === ACTIVE,
      payoutsEnabled: merchant?.stripe_balance?.payouts?.status === ACTIVE,
      detailsSubmitted: !(requirements?.entries ?? []).some(
        (entry) =>
          entry.awaiting_action_from === 'user' &&
          BLOCKING_DEADLINES.has(entry.minimum_deadline.status),
      ),
    };
  }
}
