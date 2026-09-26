import type { SessionPayload } from '@bookink/shared/auth';

export type PayloadSession = SessionPayload;

export const SESSION_TOKEN_ISSUER = Symbol('SESSION_TOKEN_ISSUER');

export interface SessionTokenIssuer {
  issueAccessToken(claims: PayloadSession): string;
}
