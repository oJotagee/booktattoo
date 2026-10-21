import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export type ConnectRequirementKind =
  | 'name'
  | 'address'
  | 'date_of_birth'
  | 'id_number'
  | 'identity_document'
  | 'phone'
  | 'email'
  | 'bank_account'
  | 'business'
  | 'terms'
  | 'other';

export interface ConnectRequirement {
  kind: ConnectRequirementKind;
  rejected: boolean;
}

export interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  paymentsEnabled: boolean;
  pendingRequirements: ConnectRequirement[];
}

export async function getConnectStatus(): Promise<ConnectStatus> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const { data } = await api.get<ConnectStatus>('/billing/connect', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { ...data, pendingRequirements: data.pendingRequirements ?? [] };
}
