import type { SubscriptionPlan } from '@bookink/shared/events';

export const PLAN_CATALOG = Symbol('PLAN_CATALOG');

export interface PlanCatalog {
  priceIdFor(plan: SubscriptionPlan): string;
  planFor(priceId: string): SubscriptionPlan;
}
