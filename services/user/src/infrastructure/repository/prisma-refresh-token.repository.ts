import { Injectable } from '@nestjs/common';
import type { RefreshTokenRepository } from '@/application/port/refresh-token-repository.port';
import type { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import { RefreshTokenMapper } from '../persistence/refresh-token.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    return refreshToken ? RefreshTokenMapper.toDomain(refreshToken) : null;
  }

  async create(refreshToken: RefreshTokenEntity): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(refreshToken);

    await this.prisma.refreshToken.create({ data });
  }

  async update(refreshToken: RefreshTokenEntity): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(refreshToken);

    await this.prisma.refreshToken.update({ where: { id: refreshToken.id }, data });
  }
}
