import { beforeEach, describe, expect, it } from 'bun:test';

import { SyncConnectedAccountUseCase } from '@/application/use-cases/connect/sync-connected-account.use-case';
import { buildConnectedAccount } from '@tests/unit/support/builders';
import {
  createConnectedAccountRepositoryMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

const enabled = { chargesEnabled: true, payoutsEnabled: true, detailsSubmitted: true };

describe('SyncConnectedAccountUseCase', () => {
  let accounts: ReturnType<typeof createConnectedAccountRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: SyncConnectedAccountUseCase;

  beforeEach(() => {
    accounts = createConnectedAccountRepositoryMock();
    publisher = createEventPublisherMock();
    useCase = new SyncConnectedAccountUseCase(accounts, publisher);
  });

  it('publishes and saves when the status changes', async () => {
    const account = buildConnectedAccount({
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    });

    const result = await useCase.execute({ account, status: enabled, eventId: 'evt_1' });

    expect(result.paymentsEnabled).toBe(true);
    expect(accounts.save).toHaveBeenCalledWith(result);
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_1',
        type: 'payment.connect.account.updated',
        correlationId: 'user-1',
        payload: {
          userId: 'user-1',
          stripeAccountId: 'acct_123',
          chargesEnabled: true,
          payoutsEnabled: true,
          paymentsEnabled: true,
        },
      }),
    );
  });

  it('does nothing when the status is unchanged', async () => {
    const account = buildConnectedAccount();

    const result = await useCase.execute({ account, status: enabled });

    expect(result).toBe(account);
    expect(accounts.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('does not save when publishing fails, so a retry publishes again', async () => {
    publisher.publish = async () => {
      throw new Error('RabbitMQ indisponível');
    };
    const account = buildConnectedAccount({ payoutsEnabled: false });

    await expect(useCase.execute({ account, status: enabled })).rejects.toThrow();
    expect(accounts.save).not.toHaveBeenCalled();
  });
});
