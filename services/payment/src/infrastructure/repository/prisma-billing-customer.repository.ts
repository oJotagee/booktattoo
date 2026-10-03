import { Injectable } from '@nestjs/common';

import type { BillingCustomerRepository } from '@/application/port/billing-customer-repository.port';
import type { BillingCustomerEntity } from '@/domain/entities/billing-customer.entity';
import { BillingCustomerMapper } from '../persistence/billing-customer.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaBillingCustomerRepository implements BillingCustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<BillingCustomerEntity | null> {
    const customer = await this.prisma.billingCustomer.findUnique({ where: { userId } });

    return customer ? BillingCustomerMapper.toDomain(customer) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<BillingCustomerEntity | null> {
    const customer = await this.prisma.billingCustomer.findUnique({ where: { stripeCustomerId } });

    return customer ? BillingCustomerMapper.toDomain(customer) : null;
  }

  async create(customer: BillingCustomerEntity): Promise<void> {
    const data = BillingCustomerMapper.toPersistence(customer);

    await this.prisma.billingCustomer.create({ data });
  }
}
