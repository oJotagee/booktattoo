import type { UserModel as PrismaUser } from '@generated/prisma/models';

import { UserEntity, type UserStatus } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

export class UserMapper {
  static toDomain(user: PrismaUser): UserEntity {
    return UserEntity.restore({
      id: user.id,
      name: user.name ?? '',
      email: Email.create({ value: user.email }),
      emailVerified: user.emailVerified,
      image: user.image,
      passwordHash: user.passwordHash,
      address: user.address,
      phone: user.phone,
      bio: user.bio,
      status: user.status as unknown as UserStatus,
      times: user.times,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static toPersistence(user: UserEntity): PrismaUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      emailVerified: user.emailVerified,
      image: user.image,
      passwordHash: user.passwordHash,
      address: user.address,
      phone: user.phone,
      bio: user.bio,
      status: user.status as unknown as PrismaUser['status'],
      times: user.times,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
