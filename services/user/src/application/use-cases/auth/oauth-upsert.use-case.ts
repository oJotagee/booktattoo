import { Inject, Injectable } from '@nestjs/common';

import { AccountEntity, type AccountProvider } from '@/domain/entities/account.entity';
import type { RefreshTokenRepository } from '../../port/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../port/refresh-token-repository.port';
import type { SessionTokenIssuer } from '../../port/session-token-issuer.port';
import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import type { AccountRepository } from '../../port/account-repository.port';
import { SESSION_TOKEN_ISSUER } from '../../port/session-token-issuer.port';
import { ACCOUNT_REPOSITORY } from '../../port/account-repository.port';
import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import type { UserRepository } from '../../port/user-repository.port';
import type { TokenGenerator } from '../../port/token-generator.port';
import { TOKEN_GENERATOR } from '../../port/token-generator.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { Email } from '@/domain/value-objects/email.vo';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type OAuthUpsertInput = {
  provider: AccountProvider;
  providerAccountId: string;
  email: string;
  name: string | null;
  image: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  idToken?: string | null;
};

type OAuthUpsertOutput = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    address?: string | null;
    phone?: string | null;
    bio?: string | null;
    role?: string | null;
    times: string[];
    status: string;
  };
};

@Injectable()
export class OAuthUpsertUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepository,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    @Inject(SESSION_TOKEN_ISSUER) private readonly sessionTokenIssuer: SessionTokenIssuer,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(input: OAuthUpsertInput): Promise<OAuthUpsertOutput> {
    const email = Email.create({ value: input.email });

    const existingAccount = await this.accounts.findByProvider(
      input.provider,
      input.providerAccountId,
    );

    const user = existingAccount
      ? await this.reuseExistingAccount(existingAccount, input)
      : await this.linkOrCreateUser(email, input);

    const accessToken = this.sessionTokenIssuer.issueAccessToken({
      sub: user.id,
      email: user.email.toString(),
    });

    const opaqueRefreshToken = this.tokenGenerator.generateOpaqueToken();

    const refreshToken = RefreshTokenEntity.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: this.tokenGenerator.hashOpaqueToken(opaqueRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    await this.refreshTokens.create(refreshToken);

    return {
      accessToken,
      refreshToken: opaqueRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email.toString(),
        image: user.image,
        address: user.address,
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        times: user.times,
        status: user.status,
      },
    };
  }

  private async reuseExistingAccount(
    existingAccount: AccountEntity,
    input: OAuthUpsertInput,
  ): Promise<UserEntity> {
    const refreshedAccount = existingAccount.refreshTokens({
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
      idToken: input.idToken,
    });

    await this.accounts.update(refreshedAccount);

    const user = await this.users.findById(existingAccount.userId);
    if (!user) throw new Error(`Conta OAuth órfã: user ${existingAccount.userId} não existe mais.`);

    return user;
  }

  private async linkOrCreateUser(email: Email, input: OAuthUpsertInput): Promise<UserEntity> {
    const existingUser = await this.users.findByEmail(email.value);

    let user = existingUser;
    if (!user) {
      user = UserEntity.create({
        id: crypto.randomUUID(),
        name: input.name ?? email.value,
        email,
        emailVerified: new Date(),
        image: input.image,
        address: null,
        phone: null,
        bio: null,
        role: null,
        status: UserStatus.ACTIVE,
        times: [],
        stripeCustomerId: null,
      });

      await this.users.create(user);
    }

    const account = AccountEntity.create({
      userId: user.id,
      type: 'oauth',
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
      idToken: input.idToken,
    });

    await this.accounts.create(account);

    return user;
  }
}
