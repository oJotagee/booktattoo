import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
  prefetch: Number(process.env.RABBITMQ_PREFETCH ?? 10),
  reconnectDelayMs: Number(process.env.RABBITMQ_RECONNECT_DELAY_MS ?? 5000),
}));
