import { MAIL_PORT, renderBrandEmail } from '@bookink/shared/mail';
import type { MailPort } from '@bookink/shared/mail';
import { Inject, Injectable } from '@nestjs/common';

import type { PasswordResetTokenRepository } from '../../port/password-reset-token-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../port/password-reset-token-repository.port';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import type { TokenGenerator } from '../../port/token-generator.port';
import type { UserRepository } from '../../port/user-repository.port';
import { TOKEN_GENERATOR } from '../../port/token-generator.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

type ForgotPasswordInput = {
  email: string;
};

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokens: PasswordResetTokenRepository,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
  ) {}

  async execute({ email }: ForgotPasswordInput): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    const opaqueToken = this.tokenGenerator.generateOpaqueToken();

    const passwordResetToken = PasswordResetTokenEntity.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: this.tokenGenerator.hashOpaqueToken(opaqueToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });

    await this.passwordResetTokens.create(passwordResetToken);

    const resetUrl = `${process.env.FRONTEND_RESET_PASSWORD_URL ?? 'http://localhost:3000/reset-password'}/${opaqueToken}`;

    const html = renderBrandEmail({
      preheader: 'Redefina sua senha do BookTattoo. Este link expira em 1 hora.',
      heading: 'Redefinição de senha',
      bodyHtml:
        '<p style="margin:0 0 12px 0;">Você solicitou a redefinição da sua senha.</p>' +
        '<p style="margin:0;">Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>',
      ctaLabel: 'Redefinir senha',
      ctaUrl: resetUrl,
      footerNote: 'Se você não solicitou isso, pode ignorar este email com segurança.',
    });

    await this.mail.send({
      to: user.email.toString(),
      subject: 'Redefinição de senha',
      html,
    });
  }
}
