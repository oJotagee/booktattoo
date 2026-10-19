import type { ConnectedAccountEntity } from '@/domain/entities/connected-account.entity';

export const CONNECTED_ACCOUNT_REPOSITORY = Symbol('CONNECTED_ACCOUNT_REPOSITORY');

export interface ConnectedAccountRepository {
  findByUserId(userId: string): Promise<ConnectedAccountEntity | null>;
  findByStripeAccountId(stripeAccountId: string): Promise<ConnectedAccountEntity | null>;
  save(account: ConnectedAccountEntity): Promise<void>;
}
