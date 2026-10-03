import type { PlanAccess } from '@/domain/plan/plan-access';

export const PLAN_ACCESS_GATEWAY = Symbol('PLAN_ACCESS_GATEWAY');

export interface PlanAccessGateway {
  getPlanAccess(authorization: string): Promise<PlanAccess>;
}
