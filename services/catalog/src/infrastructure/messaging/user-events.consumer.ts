import { type UserProfileEvent, RabbitMQConnection } from '@bookink/shared/events';
import { Injectable, type OnModuleInit } from '@nestjs/common';

import { UserEventsHandler } from '@/application/handlers/user-events.handler';

const QUEUE = 'catalog.user-events';

@Injectable()
export class UserEventsConsumer implements OnModuleInit {
  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly handler: UserEventsHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connection.subscribe({
      queue: QUEUE,
      routingKeys: ['user.profile.*'],
      handler: (event) => this.handler.handle(event as UserProfileEvent),
    });
  }
}
