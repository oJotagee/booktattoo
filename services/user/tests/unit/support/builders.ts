import { ServiceEntity } from '@/domain/entities/service.entity';
import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

export function buildUser(
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    address: string | null;
    phone: string | null;
    bio: string | null;
    role: string | null;
    status: UserStatus;
    times: string[];
    stripeCustomerId: string | null;
    password: string | null;
  }> = {},
): UserEntity {
  return UserEntity.create({
    id: overrides.id ?? 'user-1',
    name: overrides.name ?? 'John Doe',
    email: Email.create({ value: overrides.email ?? 'john.doe@example.com' }),
    image: overrides.image ?? null,
    address: overrides.address ?? null,
    phone: overrides.phone ?? null,
    bio: overrides.bio ?? null,
    role: overrides.role ?? null,
    status: overrides.status ?? UserStatus.ACTIVE,
    times: overrides.times ?? [],
    stripeCustomerId: overrides.stripeCustomerId ?? null,
    password: overrides.password ?? null,
  });
}

export function buildService(
  overrides: Partial<{
    id: string;
    name: string;
    duration: number;
    depositAmount: number;
    userId: string;
  }> = {},
): ServiceEntity {
  return ServiceEntity.create({
    id: overrides.id ?? 'service-1',
    name: overrides.name ?? 'Tatuagem Fineline',
    duration: overrides.duration ?? 60,
    depositAmount: overrides.depositAmount ?? 5000,
    userId: overrides.userId ?? 'user-1',
  });
}
