import { describe, expect, it } from 'bun:test';
import { UnauthorizedException } from '@nestjs/common';

import { InternalApiSecretGuard } from '@/presentation/guards/internal-api-secret.guard';

const SECRET = 'a'.repeat(64);

function buildContext(headers: Record<string, string | undefined>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as never;
}

describe('InternalApiSecretGuard', () => {
  it('allows requests carrying the configured secret', () => {
    const guard = new InternalApiSecretGuard({ secret: SECRET });

    expect(guard.canActivate(buildContext({ 'x-internal-secret': SECRET }))).toBe(true);
  });

  it('rejects requests without the secret header', () => {
    const guard = new InternalApiSecretGuard({ secret: SECRET });

    expect(() => guard.canActivate(buildContext({}))).toThrow(UnauthorizedException);
  });

  it('rejects requests with a wrong secret', () => {
    const guard = new InternalApiSecretGuard({ secret: SECRET });

    expect(() => guard.canActivate(buildContext({ 'x-internal-secret': 'b'.repeat(64) }))).toThrow(
      UnauthorizedException,
    );
  });

  it('blocks every request when the secret is not configured', () => {
    const guard = new InternalApiSecretGuard({ secret: undefined });

    expect(() => guard.canActivate(buildContext({ 'x-internal-secret': '' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('blocks every request when the configured secret is too short', () => {
    const guard = new InternalApiSecretGuard({ secret: 'short' });

    expect(() => guard.canActivate(buildContext({ 'x-internal-secret': 'short' }))).toThrow(
      UnauthorizedException,
    );
  });
});
