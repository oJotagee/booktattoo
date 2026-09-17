export type PayloadSession = {
  sub: string;
  email: string;
};

export const SESSION_TOKEN_ISSUER = Symbol('SESSION_TOKEN_ISSUER');

export interface SessionTokenIssuer {
  issueAccessToken(claims: PayloadSession): string;
}
