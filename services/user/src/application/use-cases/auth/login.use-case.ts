import { Inject, Injectable } from '@nestjs/common';

import type { RefreshTokenRepository } from '../../port/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../port/refresh-token-repository.port';
import type { SessionTokenIssuer } from '../../port/session-token-issuer.port';
import { SESSION_TOKEN_ISSUER } from '../../port/session-token-issuer.port';
import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import type { PasswordHasher } from '../../port/password-hasher.port';
import type { TokenGenerator } from '../../port/token-generator.port';
import type { UserRepository } from '../../port/user-repository.port';
import { InvalidCredentialsError } from '@/domain/errors/user.error';
import { PASSWORD_HASHER } from '../../port/password-hasher.port';
import { TOKEN_GENERATOR } from '../../port/token-generator.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type LoginInput = {
  email: string;
  password: string;
};

type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    address: string | null;
    phone: string | null;
    bio: string | null;
    role: string | null;
    times: string[];
    status: string;
  };
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    @Inject(SESSION_TOKEN_ISSUER) private readonly sessionTokenIssuer: SessionTokenIssuer,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) throw new InvalidCredentialsError();

    const passwordMatches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatches) throw new InvalidCredentialsError();

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
        times: user.times,
        role: user.role,
        status: user.status,
      },
    };
  }
}
