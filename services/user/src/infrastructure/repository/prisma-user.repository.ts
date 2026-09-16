import { Injectable } from '@nestjs/common';

import { UserEntity } from '@/domain/entities/user.entity';
import type { UserRepository } from '@/application/port/user-repository.port';

import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../persistence/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user ? UserMapper.toDomain(user) : null;
  }

  async create(user: UserEntity): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.user.create({ data });
  }

  async update(user: UserEntity): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.user.update({ where: { id: user.id }, data });
  }
}
