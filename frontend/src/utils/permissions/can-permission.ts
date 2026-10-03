import { getPlanAccess, type PlanAccessStatus } from './get-plan-access';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export type PermissionType = 'service' | 'galery';

export interface ResultPermission {
  hasPermission: boolean;
  status: PlanAccessStatus;
  expired: boolean;
  limit: number | null;
  used: number;
}

const RESOURCE = {
  service: { path: '/services', limitKey: 'services' },
  galery: { path: '/galeries', limitKey: 'galeries' },
} as const;

async function countResource(type: PermissionType): Promise<number> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const { data } = await api.get<{ pagination: { total: number } }>(RESOURCE[type].path, {
    params: { limit: 1, offset: 0 },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return data.pagination.total;
}

export async function canPermission({ type }: { type: PermissionType }): Promise<ResultPermission> {
  const [access, used] = await Promise.all([getPlanAccess(), countResource(type)]);

  if (access.status === 'EXPIRED' || !access.limits) {
    return { hasPermission: false, status: access.status, expired: true, limit: null, used };
  }

  const limit = access.limits[RESOURCE[type].limitKey];

  return { hasPermission: used < limit, status: access.status, expired: false, limit, used };
}
