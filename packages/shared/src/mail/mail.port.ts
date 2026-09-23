export const MAIL_PORT = Symbol('MAIL_PORT');

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface MailPort {
  send(input: SendMailInput): Promise<void>;
}
