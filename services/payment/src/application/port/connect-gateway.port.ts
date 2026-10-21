import type { ConnectedAccountStatus } from '@/domain/entities/connected-account.entity';

export const CONNECT_GATEWAY = Symbol('CONNECT_GATEWAY');

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

export type ConnectRequirement = {
  kind: ConnectRequirementKind;
  rejected: boolean;
};

export type ConnectAccountSnapshot = {
  status: ConnectedAccountStatus;
  pendingRequirements: ConnectRequirement[];
};

export interface ConnectGateway {
  createAccount(params: { userId: string; email: string }): Promise<{ id: string }>;
  createOnboardingLink(accountId: string): Promise<{ url: string }>;
  createLoginLink(accountId: string): Promise<{ url: string }>;
  retrieveAccount(accountId: string): Promise<ConnectAccountSnapshot>;
}
