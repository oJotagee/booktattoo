export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface TokenGenerator {
  generateOpaqueToken(): string;
  hashOpaqueToken(token: string): string;
}
