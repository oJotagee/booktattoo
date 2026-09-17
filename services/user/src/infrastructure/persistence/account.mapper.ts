import type { AccountModel as PrismaAccount } from '@generated/prisma/models';

import { AccountEntity, type AccountProvider } from '@/domain/entities/account.entity';

export class AccountMapper {
  static toDomain(account: PrismaAccount): AccountEntity {
    return AccountEntity.restore({
      userId: account.userId,
      type: account.type,
      provider: account.provider as AccountProvider,
      providerAccountId: account.providerAccountId,
      refreshToken: account.refresh_token,
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      tokenType: account.token_type,
      scope: account.scope,
      idToken: account.id_token,
      sessionState: account.session_state,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  }

  static toPersistence(account: AccountEntity): PrismaAccount {
    return {
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refreshToken,
      access_token: account.accessToken,
      expires_at: account.expiresAt,
      token_type: account.tokenType,
      scope: account.scope,
      id_token: account.idToken,
      session_state: account.sessionState,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
