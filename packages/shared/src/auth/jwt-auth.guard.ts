import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AUTH_TOKEN_PAYLOAD } from './auth.constant';
import jwtVerifyConfig from './jwt-verify.config';
import type { SessionPayload } from './session-payload';

type IncomingRequest = {
  headers: { authorization?: string };
  [AUTH_TOKEN_PAYLOAD]?: SessionPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtVerifyConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtVerifyConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IncomingRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Token ausente.');

    try {
      const payload = await this.jwtService.verifyAsync<SessionPayload>(token, {
        secret: this.jwtConfiguration.secret,
        algorithms: ['HS256'],
      });
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
