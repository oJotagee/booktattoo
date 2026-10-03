import { type PaymentSubscriptionEvent, RabbitMQConnection } from '@bookink/shared/events';
import { Injectable, type OnModuleInit } from '@nestjs/common';

import { PaymentEventsHandler } from '@/application/handlers/payment-events.handler';

const QUEUE = 'user.payment-events';

@Injectable()
export class PaymentEventsConsumer implements OnModuleInit {
  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly handler: PaymentEventsHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connection.subscribe({
      queue: QUEUE,
      routingKeys: ['payment.subscription.*'],
      handler: (event) => this.handler.handle(event as PaymentSubscriptionEvent),
    });
  }
}
