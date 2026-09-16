import type { RefreshTokenModel as PrismaRefreshToken } from '@generated/prisma/models';

import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(refreshToken: PrismaRefreshToken): RefreshTokenEntity {
    return RefreshTokenEntity.restore({
      id: refreshToken.id,
      userId: refreshToken.userId,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
      createdAt: refreshToken.createdAt,
    });
  }

  static toPersistence(refreshToken: RefreshTokenEntity): PrismaRefreshToken {
    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
      createdAt: refreshToken.createdAt,
    };
  }
}
