export type SessionClaims = {
  sub: string;
  email: string;
};

export const SESSION_TOKEN_ISSUER = Symbol('SESSION_TOKEN_ISSUER');

export interface SessionTokenIssuer {
  issueAccessToken(claims: SessionClaims): string;
}
