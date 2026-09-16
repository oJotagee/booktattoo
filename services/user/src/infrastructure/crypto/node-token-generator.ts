import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { TokenGenerator } from '@/application/port/token-generator.port';

@Injectable()
export class NodeTokenGenerator implements TokenGenerator {
  generateOpaqueToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
