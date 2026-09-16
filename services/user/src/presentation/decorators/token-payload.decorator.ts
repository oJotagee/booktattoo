import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AUTH_TOKEN_PAYLOAD } from '../../infrastructure/auth/auth.constant';
import type { SessionClaims } from '../../application/port/session-token-issuer.port';

export const TokenPayload = createParamDecorator((_data: unknown, context: ExecutionContext): SessionClaims => {
  const request = context.switchToHttp().getRequest();
  return request[AUTH_TOKEN_PAYLOAD];
});
