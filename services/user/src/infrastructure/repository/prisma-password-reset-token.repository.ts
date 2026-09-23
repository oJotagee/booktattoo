import { Injectable } from '@nestjs/common';
import type { PasswordResetTokenRepository } from '@/application/port/password-reset-token-repository.port';
import type { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../persistence/password-reset-token.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    const passwordResetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    return passwordResetToken ? PasswordResetTokenMapper.toDomain(passwordResetToken) : null;
  }

  async create(passwordResetToken: PasswordResetTokenEntity): Promise<void> {
    const data = PasswordResetTokenMapper.toPersistence(passwordResetToken);

    await this.prisma.passwordResetToken.create({ data });
  }

  async update(passwordResetToken: PasswordResetTokenEntity): Promise<void> {
    const data = PasswordResetTokenMapper.toPersistence(passwordResetToken);

    await this.prisma.passwordResetToken.update({
      where: { id: passwordResetToken.id },
      data,
    });
  }
}
