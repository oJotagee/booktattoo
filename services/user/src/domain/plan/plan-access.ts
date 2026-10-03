import { SubscriptionPlan, type SubscriptionEntity } from '../entities/subscription.entity';

export const TRIAL_DAYS = 7;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export enum PlanAccessStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export type PlanLimits = {
  services: number;
  galeries: number;
};

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.BASIC]: { services: 3, galeries: 5 },
  [SubscriptionPlan.PROFESSIONAL]: { services: 20, galeries: 50 },
};

export type PlanAccess = {
  status: PlanAccessStatus;
  plan: SubscriptionPlan | null;
  limits: PlanLimits | null;
  trialEndsAt: Date;
  trialDaysLeft: number;
};

type ResolvePlanAccessInput = {
  userCreatedAt: Date;
  subscription: SubscriptionEntity | null;
  now?: Date;
};

export function resolvePlanAccess({
  userCreatedAt,
  subscription,
  now = new Date(),
}: ResolvePlanAccessInput): PlanAccess {
  const trialEndsAt = new Date(userCreatedAt.getTime() + TRIAL_DAYS * DAY_IN_MS);
  const trialDaysLeft = Math.max(Math.ceil((trialEndsAt.getTime() - now.getTime()) / DAY_IN_MS), 0);

  if (subscription?.isActive) {
    return {
      status: PlanAccessStatus.ACTIVE,
      plan: subscription.plan,
      limits: PLAN_LIMITS[subscription.plan],
      trialEndsAt,
      trialDaysLeft,
    };
  }

  if (now < trialEndsAt) {
    return {
      status: PlanAccessStatus.TRIAL,
      plan: null,
      limits: PLAN_LIMITS[SubscriptionPlan.PROFESSIONAL],
      trialEndsAt,
      trialDaysLeft,
    };
  }

  return {
    status: PlanAccessStatus.EXPIRED,
    plan: null,
    limits: null,
    trialEndsAt,
    trialDaysLeft: 0,
  };
}
