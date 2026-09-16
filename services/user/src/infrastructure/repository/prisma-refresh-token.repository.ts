import { Injectable } from '@nestjs/common';

import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import type { RefreshTokenRepository } from '@/application/port/refresh-token-repository.port';

import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenMapper } from '../persistence/refresh-token.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) { }

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
