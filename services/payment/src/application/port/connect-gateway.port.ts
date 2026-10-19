import type { ConnectedAccountStatus } from '@/domain/entities/connected-account.entity';

export const CONNECT_GATEWAY = Symbol('CONNECT_GATEWAY');

export interface ConnectGateway {
  createAccount(params: { userId: string; email: string }): Promise<{ id: string }>;
  createOnboardingLink(accountId: string): Promise<{ url: string }>;
  createLoginLink(accountId: string): Promise<{ url: string }>;
  retrieveAccountStatus(accountId: string): Promise<ConnectedAccountStatus>;
}
