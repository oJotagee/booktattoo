import { type AppointmentEvent, RabbitMQConnection } from '@bookink/shared/events';
import { Injectable, type OnModuleInit } from '@nestjs/common';

import { AppointmentEventsHandler } from '@/application/handlers/appointment-events.handler';

const QUEUE = 'catalog.appointment-events';

@Injectable()
export class AppointmentEventsConsumer implements OnModuleInit {
  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly handler: AppointmentEventsHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connection.subscribe({
      queue: QUEUE,
      routingKeys: ['appointment.*'],
      handler: (event) => this.handler.handle(event as AppointmentEvent),
    });
  }
}
