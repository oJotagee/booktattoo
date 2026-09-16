import { InvalidAccountError } from '../errors/account.error';

export type AccountProvider = 'google' | 'github' | 'credentials';

type AccountProps = {
  userId: string;
  type: string;
  provider: AccountProvider;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AccountCreateInput = {
  userId: string;
  type: string;
  provider: AccountProvider;
  providerAccountId: string;
  refreshToken?: string | null;
  accessToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  sessionState?: string | null;
};

type AccountRestoreInput = AccountProps;

export class AccountEntity {
  private constructor(private readonly accountProps: AccountProps) {
    AccountEntity.validate(accountProps);
  }

  get userId(): string {
    return this.accountProps.userId;
  }

  get type(): string {
    return this.accountProps.type;
  }

  get provider(): AccountProvider {
    return this.accountProps.provider;
  }

  get providerAccountId(): string {
    return this.accountProps.providerAccountId;
  }

  get refreshToken(): string | null {
    return this.accountProps.refreshToken;
  }

  get accessToken(): string | null {
    return this.accountProps.accessToken;
  }

  get expiresAt(): number | null {
    return this.accountProps.expiresAt;
  }

  get tokenType(): string | null {
    return this.accountProps.tokenType;
  }

  get scope(): string | null {
    return this.accountProps.scope;
  }

  get idToken(): string | null {
    return this.accountProps.idToken;
  }

  get sessionState(): string | null {
    return this.accountProps.sessionState;
  }

  get createdAt(): Date {
    return this.accountProps.createdAt;
  }

  get updatedAt(): Date {
    return this.accountProps.updatedAt;
  }

  static create(input: AccountCreateInput): AccountEntity {
    const now = new Date();

    return new AccountEntity({
      userId: input.userId,
      type: input.type,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      refreshToken: input.refreshToken ?? null,
      accessToken: input.accessToken ?? null,
      expiresAt: input.expiresAt ?? null,
      tokenType: input.tokenType ?? null,
      scope: input.scope ?? null,
      idToken: input.idToken ?? null,
      sessionState: input.sessionState ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(input: AccountRestoreInput): AccountEntity {
    return new AccountEntity({ ...input });
  }

  refreshTokens(input: {
    refreshToken?: string | null;
    accessToken?: string | null;
    expiresAt?: number | null;
    idToken?: string | null;
  }): AccountEntity {
    return new AccountEntity({
      ...this.accountProps,
      refreshToken: input.refreshToken ?? this.refreshToken,
      accessToken: input.accessToken ?? this.accessToken,
      expiresAt: input.expiresAt ?? this.expiresAt,
      idToken: input.idToken ?? this.idToken,
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): {
    userId: string;
    provider: AccountProvider;
    providerAccountId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      userId: this.userId,
      provider: this.provider,
      providerAccountId: this.providerAccountId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static validate(props: AccountProps) {
    if (!props.userId.trim()) throw new InvalidAccountError('Account must belong to a user.');
    if (!props.provider.trim()) throw new InvalidAccountError('Account provider cannot be empty.');
    if (!props.providerAccountId.trim())
      throw new InvalidAccountError('Account providerAccountId cannot be empty.');
  }
}
