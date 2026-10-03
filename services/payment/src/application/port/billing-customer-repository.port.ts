import type { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';

export const BILLING_CUSTOMER_REPOSITORY = Symbol('BILLING_CUSTOMER_REPOSITORY');

export interface BillingCustomerRepository {
  findByUserId(userId: string): Promise<BillingCustomerEntity | null>;
  findByStripeCustomerId(stripeCustomerId: string): Promise<BillingCustomerEntity | null>;
  create(customer: BillingCustomerEntity): Promise<void>;
}
