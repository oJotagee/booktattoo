import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { SessionClaims, SessionTokenIssuer } from '@/application/port/session-token-issuer.port';

@Injectable()
export class JwtSessionTokenIssuer implements SessionTokenIssuer {
  constructor(private readonly jwtService: JwtService) {}

  issueAccessToken(claims: SessionClaims): string {
    return this.jwtService.sign(claims);
  }
}
