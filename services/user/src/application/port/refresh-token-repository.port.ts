import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface RefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  create(refreshToken: RefreshTokenEntity): Promise<void>;
  update(refreshToken: RefreshTokenEntity): Promise<void>;
}
