import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenExpiredError,
  PasswordResetTokenUsedError,
} from '../errors/password-reset-token.error';

type PasswordResetTokenProps = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

type PasswordResetTokenCreateInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type PasswordResetTokenRestoreInput = PasswordResetTokenProps;

export class PasswordResetTokenEntity {
  private constructor(private readonly passwordResetTokenProps: PasswordResetTokenProps) {
    PasswordResetTokenEntity.validate(passwordResetTokenProps);
  }

  get id(): string {
    return this.passwordResetTokenProps.id;
  }

  get userId(): string {
    return this.passwordResetTokenProps.userId;
  }

  get tokenHash(): string {
    return this.passwordResetTokenProps.tokenHash;
  }

  get expiresAt(): Date {
    return this.passwordResetTokenProps.expiresAt;
  }

  get usedAt(): Date | null {
    return this.passwordResetTokenProps.usedAt;
  }

  get createdAt(): Date {
    return this.passwordResetTokenProps.createdAt;
  }

  get isUsed(): boolean {
    return this.passwordResetTokenProps.usedAt !== null;
  }

  get isExpired(): boolean {
    return this.passwordResetTokenProps.expiresAt.getTime() <= Date.now();
  }

  static create(input: PasswordResetTokenCreateInput): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity({
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    });
  }

  static restore(input: PasswordResetTokenRestoreInput): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity({ ...input });
  }

  assertUsable(): void {
    if (this.isUsed) throw new PasswordResetTokenUsedError();
    if (this.isExpired) throw new PasswordResetTokenExpiredError();
  }

  markUsed(): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity({
      ...this.passwordResetTokenProps,
      usedAt: new Date(),
    });
  }

  private static validate(props: PasswordResetTokenProps) {
    if (!props.id.trim())
      throw new InvalidPasswordResetTokenError('PasswordResetToken id cannot be empty.');
    if (!props.userId.trim())
      throw new InvalidPasswordResetTokenError('PasswordResetToken must belong to a user.');
    if (!props.tokenHash.trim())
      throw new InvalidPasswordResetTokenError('PasswordResetToken tokenHash cannot be empty.');
  }
}
