import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import type { ConnectedAccountStatus } from '@/domain/entities/connected-account.entity';
import type {
  ConnectAccountSnapshot,
  ConnectGateway,
  ConnectRequirement,
  ConnectRequirementKind,
} from '@/application/port/connect-gateway.port';
import stripeConfig from '../config/stripe.config';
import { STRIPE_CLIENT } from './stripe.client';

type V2Account = Awaited<ReturnType<Stripe['v2']['core']['accounts']['retrieve']>>;
type RequirementEntry = NonNullable<NonNullable<V2Account['requirements']>['entries']>[number];

const ACTIVE = 'active';
const BLOCKING_DEADLINES = new Set(['currently_due', 'past_due']);

const REQUIREMENT_KINDS: Array<[RegExp, ConnectRequirementKind]> = [
  [/address/, 'address'],
  [/given_name|surname/, 'name'],
  [/date_of_birth/, 'date_of_birth'],
  [/id_numbers/, 'id_number'],
  [/verification\.(document|additional_document|proof_of_liveness)/, 'identity_document'],
  [/phone/, 'phone'],
  [/email/, 'email'],
  [/external_account|outbound_destination|bank_account|payout_method/, 'bank_account'],
  [/attestations|terms_of_service|tos_acceptance/, 'terms'],
  [/business_details|profile|entity_type/, 'business'],
];

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

  async retrieveAccount(accountId: string): Promise<ConnectAccountSnapshot> {
    const account = await this.stripe.v2.core.accounts.retrieve(accountId, {
      include: ['configuration.merchant', 'configuration.recipient', 'requirements'],
    });

    return {
      status: StripeConnectGateway.toStatus(account),
      pendingRequirements: StripeConnectGateway.toPendingRequirements(account),
    };
  }

  static toStatus({ configuration, requirements }: V2Account): ConnectedAccountStatus {
    const merchant = configuration?.merchant?.capabilities;
    const recipient = configuration?.recipient?.capabilities;

    return {
      chargesEnabled:
        merchant?.card_payments?.status === ACTIVE &&
        recipient?.stripe_balance?.stripe_transfers?.status === ACTIVE,
      payoutsEnabled: merchant?.stripe_balance?.payouts?.status === ACTIVE,
      detailsSubmitted: !(requirements?.entries ?? []).some(StripeConnectGateway.isBlocking),
    };
  }

  static toPendingRequirements({ requirements }: V2Account): ConnectRequirement[] {
    const rejectedByKind = new Map<ConnectRequirementKind, boolean>();

    for (const entry of requirements?.entries ?? []) {
      if (!StripeConnectGateway.isBlocking(entry)) continue;

      const kind = StripeConnectGateway.toRequirementKind(entry.description);
      const rejected = (entry.errors ?? []).length > 0;

      rejectedByKind.set(kind, (rejectedByKind.get(kind) ?? false) || rejected);
    }

    return [...rejectedByKind].map(([kind, rejected]) => ({ kind, rejected }));
  }

  private static isBlocking(entry: RequirementEntry): boolean {
    return (
      entry.awaiting_action_from === 'user' && BLOCKING_DEADLINES.has(entry.minimum_deadline.status)
    );
  }

  private static toRequirementKind(field: string): ConnectRequirementKind {
    return REQUIREMENT_KINDS.find(([pattern]) => pattern.test(field))?.[1] ?? 'other';
  }
}
