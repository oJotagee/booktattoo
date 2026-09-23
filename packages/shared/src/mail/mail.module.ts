import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailConfig from './mail.config';
import { MAIL_PORT } from './mail.port';
import { NodemailerMailAdapter } from './nodemailer-mail.adapter';

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
