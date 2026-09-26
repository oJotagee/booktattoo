import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { AUTH_TOKEN_PAYLOAD } from './auth.constant';
import type { SessionPayload } from './session-payload';

export const TokenPayload = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionPayload => {
    const request = context.switchToHttp().getRequest();
    return request[AUTH_TOKEN_PAYLOAD];
  },
);
