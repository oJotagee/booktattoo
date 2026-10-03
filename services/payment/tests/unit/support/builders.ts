import { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';

export function buildBillingCustomer(
  overrides: Partial<{ userId: string; stripeCustomerId: string; email: string }> = {},
): BillingCustomerEntity {
  return BillingCustomerEntity.create({
    userId: overrides.userId ?? 'user-1',
    stripeCustomerId: overrides.stripeCustomerId ?? 'cus_123',
    email: overrides.email ?? 'john.doe@example.com',
  });
}
