import type { PaymentConnectEvent, PaymentSubscriptionEvent } from '@bookink/shared/events';
import { Injectable } from '@nestjs/common';

import { SyncSubscriptionUseCase } from '../use-cases/subscription/sync-subscription.use-case';
import { SyncPaymentsEnabledUseCase } from '../use-cases/user/sync-payments-enabled.use-case';
import { SubscriptionPlan } from '@/domain/entities/subscription.entity';

@Injectable()
export class PaymentEventsHandler {
  constructor(
    private readonly syncSubscription: SyncSubscriptionUseCase,
    private readonly syncPaymentsEnabled: SyncPaymentsEnabledUseCase,
  ) {}

  async handle(event: PaymentSubscriptionEvent | PaymentConnectEvent): Promise<void> {
    switch (event.type) {
      case 'payment.subscription.activated':
      case 'payment.subscription.updated':
      case 'payment.subscription.canceled':
        return this.onSubscriptionChanged(event);
      case 'payment.connect.account.updated':
        return this.syncPaymentsEnabled.execute({
          userId: event.payload.userId,
          paymentsEnabled: event.payload.paymentsEnabled,
        });
    }
  }

  private async onSubscriptionChanged({
    payload,
    occurredAt,
  }: PaymentSubscriptionEvent): Promise<void> {
    await this.syncSubscription.execute({
      userId: payload.userId,
      stripeSubscriptionId: payload.stripeSubscriptionId,
      status: payload.status,
      plan: SubscriptionPlan[payload.plan],
      priceId: payload.priceId,
      currentPeriodEnd: payload.currentPeriodEnd ? new Date(payload.currentPeriodEnd) : null,
      cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
      occurredAt: new Date(occurredAt),
    });
  }
}
