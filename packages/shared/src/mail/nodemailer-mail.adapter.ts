import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import mailConfig from './mail.config';
import type { MailPort, SendMailInput } from './mail.port';

@Injectable()
export class NodemailerMailAdapter implements MailPort {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(
    @Inject(mailConfig.KEY)
    private readonly config: ConfigType<typeof mailConfig>,
  ) {
    if (!config.password) {
      throw new Error('MAIL_PASSWORD não configurado');
    }

    this.from = config.from;

    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async send(input: SendMailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
