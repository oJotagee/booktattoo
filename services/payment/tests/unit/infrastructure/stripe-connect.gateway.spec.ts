import { describe, expect, it } from 'bun:test';

import { StripeConnectGateway } from '@/infrastructure/stripe/stripe-connect.gateway';

type Account = Parameters<typeof StripeConnectGateway.toStatus>[0];

function buildAccount({
  cardPayments = 'active',
  transfers = 'active',
  payouts = 'active',
  entries = [],
}: {
  cardPayments?: string;
  transfers?: string;
  payouts?: string;
  entries?: Array<{
    awaiting_action_from: string;
    minimum_deadline: { status: string };
    description?: string;
    errors?: Array<{ code: string }>;
  }>;
} = {}): Account {
  return {
    configuration: {
      merchant: {
        capabilities: {
          card_payments: { status: cardPayments },
          stripe_balance: { payouts: { status: payouts } },
        },
      },
      recipient: {
        capabilities: { stripe_balance: { stripe_transfers: { status: transfers } } },
      },
    },
    requirements: { entries },
  } as unknown as Account;
}

describe('StripeConnectGateway.toStatus', () => {
  it('enables payments when card payments, transfers and payouts are active', () => {
    expect(StripeConnectGateway.toStatus(buildAccount())).toEqual({
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    });
  });

  it('keeps charges disabled until the transfers capability is active', () => {
    const status = StripeConnectGateway.toStatus(buildAccount({ transfers: 'pending' }));

    expect(status.chargesEnabled).toBe(false);
  });

  it('reports payouts disabled while the payouts capability is restricted', () => {
    const status = StripeConnectGateway.toStatus(buildAccount({ payouts: 'restricted' }));

    expect(status.payoutsEnabled).toBe(false);
  });

  it('treats details as not submitted while the user owes currently due requirements', () => {
    const status = StripeConnectGateway.toStatus(
      buildAccount({
        entries: [{ awaiting_action_from: 'user', minimum_deadline: { status: 'currently_due' } }],
      }),
    );

    expect(status.detailsSubmitted).toBe(false);
  });

  it('ignores requirements awaiting Stripe or only eventually due', () => {
    const status = StripeConnectGateway.toStatus(
      buildAccount({
        entries: [
          { awaiting_action_from: 'stripe', minimum_deadline: { status: 'currently_due' } },
          { awaiting_action_from: 'user', minimum_deadline: { status: 'eventually_due' } },
        ],
      }),
    );

    expect(status.detailsSubmitted).toBe(true);
  });

  it('treats a missing configuration as nothing enabled', () => {
    expect(StripeConnectGateway.toStatus({} as Account)).toEqual({
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: true,
    });
  });
});

describe('StripeConnectGateway.toPendingRequirements', () => {
  const due = (description: string, errors: Array<{ code: string }> = []) => ({
    awaiting_action_from: 'user',
    minimum_deadline: { status: 'past_due' },
    description,
    errors,
  });

  it('groups blocking requirements by kind and flags rejected data', () => {
    const requirements = StripeConnectGateway.toPendingRequirements(
      buildAccount({
        entries: [
          due('identity.individual.address.city', [
            { code: 'verification_failed_residential_address' },
          ]),
          due('identity.individual.address.line1'),
          due('identity.individual.given_name'),
          due('identity.individual.surname'),
          due('identity.individual.id_numbers.br_cpf'),
          due('identity.individual.verification.proof_of_liveness'),
          due('defaults.profile.business_url'),
          due('something.unexpected'),
        ],
      }),
    );

    expect(requirements).toEqual([
      { kind: 'address', rejected: true },
      { kind: 'name', rejected: false },
      { kind: 'id_number', rejected: false },
      { kind: 'identity_document', rejected: false },
      { kind: 'business', rejected: false },
      { kind: 'other', rejected: false },
    ]);
  });

  it('leaves out requirements awaiting Stripe or only eventually due', () => {
    const requirements = StripeConnectGateway.toPendingRequirements(
      buildAccount({
        entries: [
          { ...due('identity.individual.political_exposure'), awaiting_action_from: 'stripe' },
          { ...due('identity.individual.phone'), minimum_deadline: { status: 'eventually_due' } },
        ],
      }),
    );

    expect(requirements).toEqual([]);
  });
});
