import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { EVENT_PUBLISHER } from './event-publisher.port';
import { RabbitMQConnection } from './rabbitmq.connection';
import rabbitmqConfig from './rabbitmq.config';

@Module({
  imports: [ConfigModule.forFeature(rabbitmqConfig)],
  providers: [
    RabbitMQConnection,
    {
      provide: EVENT_PUBLISHER,
      useExisting: RabbitMQConnection,
    },
  ],
  exports: [RabbitMQConnection, EVENT_PUBLISHER],
})
export class MessagingModule {}
