import { Inject, Injectable } from '@nestjs/common';
import {
  type ConnectAccountUpdatedPayload,
  createEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
} from '@bookink/shared/events';

import type {
  ConnectedAccountEntity,
  ConnectedAccountStatus,
} from '@/domain/entities/connected-account.entity';
import {
  CONNECTED_ACCOUNT_REPOSITORY,
  type ConnectedAccountRepository,
} from '../../port/connected-account-repository.port';

type SyncConnectedAccountInput = {
  account: ConnectedAccountEntity;
  status: ConnectedAccountStatus;
  eventId?: string;
};

@Injectable()
export class SyncConnectedAccountUseCase {
  constructor(
    @Inject(CONNECTED_ACCOUNT_REPOSITORY)
    private readonly accounts: ConnectedAccountRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  async execute({
    account,
    status,
    eventId,
  }: SyncConnectedAccountInput): Promise<ConnectedAccountEntity> {
    if (account.hasStatus(status)) return account;

    const updated = account.withStatus(status);

    const payload: ConnectAccountUpdatedPayload = {
      userId: updated.userId,
      stripeAccountId: updated.stripeAccountId,
      chargesEnabled: updated.chargesEnabled,
      payoutsEnabled: updated.payoutsEnabled,
      paymentsEnabled: updated.paymentsEnabled,
    };

    await this.publisher.publish(
      createEventEnvelope('payment.connect.account.updated', payload, {
        eventId,
        correlationId: updated.userId,
      }),
    );

    await this.accounts.save(updated);

    return updated;
  }
}
