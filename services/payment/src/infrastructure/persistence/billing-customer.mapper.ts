import type { BillingCustomerModel as PrismaBillingCustomer } from '@generated/prisma/models';

import { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';

export class BillingCustomerMapper {
  static toDomain(customer: PrismaBillingCustomer): BillingCustomerEntity {
    return BillingCustomerEntity.restore({
      userId: customer.userId,
      stripeCustomerId: customer.stripeCustomerId,
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  static toPersistence(customer: BillingCustomerEntity): PrismaBillingCustomer {
    return {
      userId: customer.userId,
      stripeCustomerId: customer.stripeCustomerId,
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
