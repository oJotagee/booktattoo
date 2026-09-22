import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { AUTH_TOKEN_PAYLOAD } from './auth.constant';
import jwtConfig from '../config/jwt.config';

type IncomingRequest = {
  headers: { authorization?: string };
  [AUTH_TOKEN_PAYLOAD]?: PayloadSession;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IncomingRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Token ausente.');

    try {
      const payload = await this.jwtService.verifyAsync<PayloadSession>(
        token,
        this.jwtConfiguration,
      );
      request[AUTH_TOKEN_PAYLOAD] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  extractTokenFromHeader(request: IncomingRequest): string | undefined {
    const authorization = request?.headers?.authorization;

    if (!authorization) return;

    return authorization.split(' ')[1];
  }
}
