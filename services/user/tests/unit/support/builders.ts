import { SubscriptionEntity, SubscriptionPlan } from '@/domain/entities/subscription.entity';
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
    password: overrides.password ?? null,
  });
}

export function buildSubscription(
  overrides: Partial<{
    userId: string;
    stripeSubscriptionId: string;
    status: string;
    plan: SubscriptionPlan;
    priceId: string;
    lastEventAt: Date;
  }> = {},
): SubscriptionEntity {
  return SubscriptionEntity.create({
    id: 'subscription-1',
    userId: overrides.userId ?? 'user-1',
    stripeSubscriptionId: overrides.stripeSubscriptionId ?? 'sub_123',
    status: overrides.status ?? 'active',
    plan: overrides.plan ?? SubscriptionPlan.BASIC,
    priceId: overrides.priceId ?? 'price_basic',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    occurredAt: overrides.lastEventAt ?? new Date('2026-10-01T00:00:00.000Z'),
  });
}
