import { MessagingModule } from '@bookink/shared/events';
import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { PrismaProcessedWebhookEventRepository } from './infrastructure/repository/prisma-processed-webhook-event.repository';
import { CreateCheckoutSessionUseCase } from '@/application/use-cases/billing/create-checkout-session.use-case';
import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import { PrismaBillingCustomerRepository } from './infrastructure/repository/prisma-billing-customer.repository';
import { CreatePortalSessionUseCase } from '@/application/use-cases/billing/create-portal-session.use-case';
import { PROCESSED_WEBHOOK_EVENT_REPOSITORY } from './application/port/processed-webhook-event-repository.port';
import { BILLING_CUSTOMER_REPOSITORY } from './application/port/billing-customer-repository.port';
import { StripeWebhookController } from './presentation/controllers/stripe-webhook.controller';
import { StripeBillingGateway } from './infrastructure/stripe/stripe-billing.gateway';
import { BillingController } from './presentation/controllers/billing.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { StripeClientProvider } from './infrastructure/stripe/stripe.client';
import { BILLING_GATEWAY } from './application/port/billing-gateway.port';
import { EnvPlanCatalog } from './infrastructure/stripe/env-plan-catalog';
import { PLAN_CATALOG } from './application/port/plan-catalog.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import stripeConfig from './infrastructure/config/stripe.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [stripeConfig] }),
    JwtAuthModule,
    MessagingModule,
  ],
  controllers: [BillingController, StripeWebhookController, HealthController],
  providers: [
    PrismaService,
    StripeClientProvider,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase,
    HandleBillingWebhookUseCase,
    {
      provide: BILLING_CUSTOMER_REPOSITORY,
      useClass: PrismaBillingCustomerRepository,
    },
    {
      provide: PROCESSED_WEBHOOK_EVENT_REPOSITORY,
      useClass: PrismaProcessedWebhookEventRepository,
    },
    {
      provide: BILLING_GATEWAY,
      useClass: StripeBillingGateway,
    },
    {
      provide: PLAN_CATALOG,
      useClass: EnvPlanCatalog,
    },
  ],
})
export class AppModule {}
