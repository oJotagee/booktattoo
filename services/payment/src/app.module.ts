import { MessagingModule } from '@bookink/shared/events';
import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { PrismaProcessedWebhookEventRepository } from './infrastructure/repository/prisma-processed-webhook-event.repository';
import { PrismaBillingCustomerRepository } from './infrastructure/repository/prisma-billing-customer.repository';
import { CreateDepositCheckoutUseCase } from '@/application/use-cases/deposit/create-deposit-checkout.use-case';
import { CreateCheckoutSessionUseCase } from '@/application/use-cases/billing/create-checkout-session.use-case';
import { PROCESSED_WEBHOOK_EVENT_REPOSITORY } from './application/port/processed-webhook-event-repository.port';
import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import { CreatePortalSessionUseCase } from '@/application/use-cases/billing/create-portal-session.use-case';
import { BILLING_CUSTOMER_REPOSITORY } from './application/port/billing-customer-repository.port';
import { InternalDepositController } from './presentation/controllers/internal-deposit.controller';
import { StripeWebhookController } from './presentation/controllers/stripe-webhook.controller';
import { ChangePlanUseCase } from '@/application/use-cases/billing/change-plan.use-case';
import { StripeBillingGateway } from './infrastructure/stripe/stripe-billing.gateway';
import { BillingController } from './presentation/controllers/billing.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { StripeClientProvider } from './infrastructure/stripe/stripe.client';
import internalApiConfig from './infrastructure/config/internal-api.config';
import { BILLING_GATEWAY } from './application/port/billing-gateway.port';
import { EnvPlanCatalog } from './infrastructure/stripe/env-plan-catalog';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PLAN_CATALOG } from './application/port/plan-catalog.port';
import stripeConfig from './infrastructure/config/stripe.config';
import { CreateConnectLoginLinkUseCase } from '@/application/use-cases/connect/create-connect-login-link.use-case';
import { StartConnectOnboardingUseCase } from '@/application/use-cases/connect/start-connect-onboarding.use-case';
import { SyncConnectedAccountUseCase } from '@/application/use-cases/connect/sync-connected-account.use-case';
import { GetConnectStatusUseCase } from '@/application/use-cases/connect/get-connect-status.use-case';
import { PrismaConnectedAccountRepository } from './infrastructure/repository/prisma-connected-account.repository';
import { CONNECTED_ACCOUNT_REPOSITORY } from './application/port/connected-account-repository.port';
import { StripeConnectGateway } from './infrastructure/stripe/stripe-connect.gateway';
import { ConnectController } from './presentation/controllers/connect.controller';
import { CONNECT_GATEWAY } from './application/port/connect-gateway.port';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [stripeConfig, internalApiConfig] }),
    JwtAuthModule,
    MessagingModule,
  ],
  controllers: [
    BillingController,
    ConnectController,
    StripeWebhookController,
    InternalDepositController,
    HealthController,
  ],
  providers: [
    PrismaService,
    StripeClientProvider,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase,
    ChangePlanUseCase,
    HandleBillingWebhookUseCase,
    CreateDepositCheckoutUseCase,
    SyncConnectedAccountUseCase,
    StartConnectOnboardingUseCase,
    GetConnectStatusUseCase,
    CreateConnectLoginLinkUseCase,
    {
      provide: CONNECTED_ACCOUNT_REPOSITORY,
      useClass: PrismaConnectedAccountRepository,
    },
    {
      provide: CONNECT_GATEWAY,
      useClass: StripeConnectGateway,
    },
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
