import { Inject, Injectable } from '@nestjs/common';

import type { PasswordResetTokenRepository } from '../../port/password-reset-token-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../port/password-reset-token-repository.port';
import { PasswordResetTokenNotFoundError } from '@/domain/errors/password-reset-token.error';
import type { TokenGenerator } from '../../port/token-generator.port';
import type { PasswordHasher } from '../../port/password-hasher.port';
import type { UserRepository } from '../../port/user-repository.port';
import { PASSWORD_HASHER } from '../../port/password-hasher.port';
import { TOKEN_GENERATOR } from '../../port/token-generator.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';

type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokens: PasswordResetTokenRepository,
  ) {}

  async execute({ token, newPassword }: ResetPasswordInput): Promise<void> {
    const tokenHash = this.tokenGenerator.hashOpaqueToken(token);

    const existingToken = await this.passwordResetTokens.findByTokenHash(tokenHash);
    if (!existingToken) throw new PasswordResetTokenNotFoundError();

    existingToken.assertUsable();

    const user = await this.users.findById(existingToken.userId);
    if (!user) throw new UserNotFoundError(existingToken.userId);

    const passwordHash = await this.passwordHasher.hash(newPassword);

    await this.users.update(user.updatePassword(passwordHash));
    await this.passwordResetTokens.update(existingToken.markUsed());
  }
}
