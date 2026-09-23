import type { PasswordResetTokenModel as PrismaPasswordResetToken } from '@generated/prisma/models';

import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';

export class PasswordResetTokenMapper {
  static toDomain(passwordResetToken: PrismaPasswordResetToken): PasswordResetTokenEntity {
    return PasswordResetTokenEntity.restore({
      id: passwordResetToken.id,
      userId: passwordResetToken.userId,
      tokenHash: passwordResetToken.tokenHash,
      expiresAt: passwordResetToken.expiresAt,
      usedAt: passwordResetToken.usedAt,
      createdAt: passwordResetToken.createdAt,
    });
  }

  static toPersistence(passwordResetToken: PasswordResetTokenEntity): PrismaPasswordResetToken {
    return {
      id: passwordResetToken.id,
      userId: passwordResetToken.userId,
      tokenHash: passwordResetToken.tokenHash,
      expiresAt: passwordResetToken.expiresAt,
      usedAt: passwordResetToken.usedAt,
      createdAt: passwordResetToken.createdAt,
    };
  }
}
