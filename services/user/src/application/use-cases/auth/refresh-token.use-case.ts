import { Inject, Injectable } from '@nestjs/common';

import type { RefreshTokenRepository } from '../../port/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../port/refresh-token-repository.port';
import { RefreshTokenNotFoundError } from '@/domain/errors/refresh-token.error';
import type { SessionTokenIssuer } from '../../port/session-token-issuer.port';
import { SESSION_TOKEN_ISSUER } from '../../port/session-token-issuer.port';
import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import type { UserRepository } from '../../port/user-repository.port';
import type { TokenGenerator } from '../../port/token-generator.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { TOKEN_GENERATOR } from '../../port/token-generator.port';
import { UserNotFoundError } from '@/domain/errors/user.error';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type RefreshTokenInput = {
  refreshToken: string;
};

type RefreshTokenOutput = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    @Inject(SESSION_TOKEN_ISSUER) private readonly sessionTokenIssuer: SessionTokenIssuer,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute({ refreshToken }: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const tokenHash = this.tokenGenerator.hashOpaqueToken(refreshToken);

    const existingToken = await this.refreshTokens.findByTokenHash(tokenHash);
    if (!existingToken) throw new RefreshTokenNotFoundError();

    existingToken.assertUsable();

    const user = await this.users.findById(existingToken.userId);
    if (!user) throw new UserNotFoundError(existingToken.userId);

    await this.refreshTokens.update(existingToken.revoke());

    const accessToken = this.sessionTokenIssuer.issueAccessToken({
      sub: user.id,
      email: user.email.toString(),
    });

    const newOpaqueRefreshToken = this.tokenGenerator.generateOpaqueToken();

    const newRefreshToken = RefreshTokenEntity.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: this.tokenGenerator.hashOpaqueToken(newOpaqueRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    await this.refreshTokens.create(newRefreshToken);

    return {
      accessToken,
      refreshToken: newOpaqueRefreshToken,
    };
  }
}
