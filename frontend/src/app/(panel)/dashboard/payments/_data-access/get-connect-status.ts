import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  paymentsEnabled: boolean;
}

export async function getConnectStatus(): Promise<ConnectStatus> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const { data } = await api.get<ConnectStatus>('/billing/connect', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return data;
}
