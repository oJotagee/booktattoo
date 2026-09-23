import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { NodemailerMailAdapter } from './nodemailer-mail.adapter';
import { MAIL_PORT } from './mail.port';
import mailConfig from './mail.config';

/**
 * Módulo de email compartilhado. Importar em qualquer serviço que precise
 * enviar emails:
 *
 *   imports: [MailModule]
 *
 * e injetar via `@Inject(MAIL_PORT) private readonly mail: MailPort`.
 */
@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [
    {
      provide: MAIL_PORT,
      useClass: NodemailerMailAdapter,
    },
  ],
  exports: [MAIL_PORT],
})
export class MailModule {}
