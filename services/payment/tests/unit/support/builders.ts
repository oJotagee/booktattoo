import { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';
import { ConnectedAccountEntity } from '@/domain/entities/connected-account.entity';

export function buildBillingCustomer(
  overrides: Partial<{ userId: string; stripeCustomerId: string; email: string }> = {},
): BillingCustomerEntity {
  return BillingCustomerEntity.create({
    userId: overrides.userId ?? 'user-1',
    stripeCustomerId: overrides.stripeCustomerId ?? 'cus_123',
    email: overrides.email ?? 'john.doe@example.com',
  });
}

export function buildConnectedAccount(
  overrides: Partial<{
    userId: string;
    stripeAccountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> = {},
): ConnectedAccountEntity {
  const now = new Date('2026-10-01T00:00:00.000Z');

  return ConnectedAccountEntity.restore({
    userId: overrides.userId ?? 'user-1',
    stripeAccountId: overrides.stripeAccountId ?? 'acct_123',
    chargesEnabled: overrides.chargesEnabled ?? true,
    payoutsEnabled: overrides.payoutsEnabled ?? true,
    detailsSubmitted: overrides.detailsSubmitted ?? true,
    createdAt: now,
    updatedAt: now,
  });
}
