import { cache } from 'react';

import type { UserStatus } from '../_actions/update-status';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export interface CurrentUser {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  role: string | null;
  status: UserStatus;
  times: string[];
}

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const { data } = await api.get<CurrentUser>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return data;
});
