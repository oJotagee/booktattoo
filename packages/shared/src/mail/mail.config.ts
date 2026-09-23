import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT ?? 465),
  secure: process.env.MAIL_SECURE !== 'false',
  user: process.env.MAIL_USER ?? 'booktattoo4@gmail.com',
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM ?? 'booktattoo4@gmail.com',
}));
