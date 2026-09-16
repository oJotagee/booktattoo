import { AccountEntity, AccountProvider } from '@/domain/entities/account.entity';

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');

export interface AccountRepository {
  findByProvider(provider: AccountProvider, providerAccountId: string): Promise<AccountEntity | null>;
  findByUserId(userId: string): Promise<AccountEntity[]>;
  create(account: AccountEntity): Promise<void>;
  update(account: AccountEntity): Promise<void>;
}
