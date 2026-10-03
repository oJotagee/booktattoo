import { cache } from 'react';

import { getAccessToken } from '@/lib/get-access-token';
import type { PlanId, PlanLimits } from '@/utils/plans';
import { api } from '@/lib/api';

export type PlanAccessStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED';

export interface PlanAccess {
  status: PlanAccessStatus;
  plan: PlanId | null;
  limits: PlanLimits | null;
  trialEndsAt: string;
  trialDaysLeft: number;
  subscription: {
    status: string;
    plan: PlanId;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export const getPlanAccess = cache(async (): Promise<PlanAccess> => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const { data } = await api.get<PlanAccess>('/users/me/plan', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return data;
});
