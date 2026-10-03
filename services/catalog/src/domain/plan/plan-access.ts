import { PlanExpiredError, PlanLimitReachedError } from '../errors/plan.error';

export type PlanAccessStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED';

export type PlanResource = 'services' | 'galeries';

export type PlanAccess = {
  status: PlanAccessStatus;
  limits: Record<PlanResource, number> | null;
};

export function ensureWithinPlanLimit(
  access: PlanAccess,
  resource: PlanResource,
  currentCount: number,
): void {
  if (access.status === 'EXPIRED' || !access.limits) throw new PlanExpiredError();

  const limit = access.limits[resource];
  if (currentCount >= limit) throw new PlanLimitReachedError(resource, limit);
}
