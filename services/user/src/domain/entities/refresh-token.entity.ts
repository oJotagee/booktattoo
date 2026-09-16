import {
  InvalidRefreshTokenError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../errors/refresh-token.error';

type RefreshTokenProps = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

type RefreshTokenCreateInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type RefreshTokenRestoreInput = RefreshTokenProps;

export class RefreshTokenEntity {
  private constructor(private readonly refreshTokenProps: RefreshTokenProps) {
    RefreshTokenEntity.validate(refreshTokenProps);
  }

  get id(): string {
    return this.refreshTokenProps.id;
  }

  get userId(): string {
    return this.refreshTokenProps.userId;
  }

  get tokenHash(): string {
    return this.refreshTokenProps.tokenHash;
  }

  get expiresAt(): Date {
    return this.refreshTokenProps.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.refreshTokenProps.revokedAt;
  }

  get createdAt(): Date {
    return this.refreshTokenProps.createdAt;
  }

  get isRevoked(): boolean {
    return this.refreshTokenProps.revokedAt !== null;
  }

  get isExpired(): boolean {
    return this.refreshTokenProps.expiresAt.getTime() <= Date.now();
  }

  static create(input: RefreshTokenCreateInput): RefreshTokenEntity {
    return new RefreshTokenEntity({
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    });
  }

  static restore(input: RefreshTokenRestoreInput): RefreshTokenEntity {
    return new RefreshTokenEntity({ ...input });
  }

  assertUsable(): void {
    if (this.isRevoked) throw new RefreshTokenRevokedError();
    if (this.isExpired) throw new RefreshTokenExpiredError();
  }

  revoke(): RefreshTokenEntity {
    return new RefreshTokenEntity({
      ...this.refreshTokenProps,
      revokedAt: new Date(),
    });
  }

  toSafeJSON(): {
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt,
      revokedAt: this.revokedAt,
      createdAt: this.createdAt,
    };
  }

  private static validate(props: RefreshTokenProps) {
    if (!props.id.trim()) throw new InvalidRefreshTokenError('RefreshToken id cannot be empty.');
    if (!props.userId.trim())
      throw new InvalidRefreshTokenError('RefreshToken must belong to a user.');
    if (!props.tokenHash.trim())
      throw new InvalidRefreshTokenError('RefreshToken tokenHash cannot be empty.');
  }
}
