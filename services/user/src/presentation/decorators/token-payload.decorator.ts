import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { PayloadSession } from '../../application/port/session-token-issuer.port';
import { AUTH_TOKEN_PAYLOAD } from '../../infrastructure/auth/auth.constant';

export const TokenPayload = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PayloadSession => {
    const request = context.switchToHttp().getRequest();
    return request[AUTH_TOKEN_PAYLOAD];
  },
);
