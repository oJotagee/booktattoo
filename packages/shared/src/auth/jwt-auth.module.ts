import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import jwtVerifyConfig from './jwt-verify.config';

/**
 * Validação do access token compartilhada entre os serviços. Só verifica —
 * quem emite o token é o serviço de user. Importar em qualquer serviço que
 * tenha rotas autenticadas:
 *
 *   imports: [JwtAuthModule]
 *
 * e usar `@UseGuards(JwtAuthGuard)` + `@TokenPayload()` nos controllers.
 */
@Module({
  imports: [ConfigModule.forFeature(jwtVerifyConfig), JwtModule.register({})],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule, ConfigModule],
})
export class JwtAuthModule {}
