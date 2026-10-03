import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { type Channel, type ChannelModel, type ConfirmChannel, connect } from 'amqplib';

import type { EventPublisher } from './event-publisher.port';
import { type AnyEventEnvelope, BOOKINK_EVENTS_EXCHANGE } from './event-envelope';
import rabbitmqConfig from './rabbitmq.config';

export type EventSubscription = {
  queue: string;
  routingKeys: string[];
  handler: (event: AnyEventEnvelope) => Promise<void>;
};

export class MessagingUnavailableError extends Error {
  constructor() {
    super('RabbitMQ indisponível no momento.');
    this.name = 'MessagingUnavailableError';
  }
}

@Injectable()
export class RabbitMQConnection implements EventPublisher, OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConnection.name);
  private readonly subscriptions: EventSubscription[] = [];
  private model: ChannelModel | null = null;
  private publishChannel: ConfirmChannel | null = null;
  private consumeChannel: Channel | null = null;
  private shuttingDown = false;

  constructor(
    @Inject(rabbitmqConfig.KEY)
    private readonly config: ConfigType<typeof rabbitmqConfig>,
  ) {}

  onApplicationBootstrap(): void {
    void this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.shuttingDown = true;
    await this.model?.close().catch(() => undefined);
  }

  async subscribe(subscription: EventSubscription): Promise<void> {
    this.subscriptions.push(subscription);

    if (this.consumeChannel) await this.setupSubscription(this.consumeChannel, subscription);
  }

  async publish(event: AnyEventEnvelope): Promise<void> {
    const channel = this.publishChannel;
    if (!channel) throw new MessagingUnavailableError();

    await channel.assertExchange(BOOKINK_EVENTS_EXCHANGE, 'topic', { durable: true });

    channel.publish(BOOKINK_EVENTS_EXCHANGE, event.type, Buffer.from(JSON.stringify(event)), {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
      type: event.type,
      timestamp: Date.parse(event.occurredAt),
    });

    await channel.waitForConfirms();
  }

  private async connect(): Promise<void> {
    while (!this.shuttingDown) {
      try {
        const model = await connect(this.config.url);

        model.on('error', (error: Error) => this.logger.error(`Erro na conexão: ${error.message}`));
        model.on('close', () => this.handleClose());

        this.model = model;
        this.publishChannel = await model.createConfirmChannel();
        this.consumeChannel = await model.createChannel();
        await this.consumeChannel.prefetch(this.config.prefetch);

        for (const subscription of this.subscriptions) {
          await this.setupSubscription(this.consumeChannel, subscription);
        }

        this.logger.log('Conectado ao RabbitMQ');
        return;
      } catch (error) {
        this.logger.warn(
          `Falha ao conectar no RabbitMQ (${(error as Error).message}), tentando novamente em ${this.config.reconnectDelayMs}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.config.reconnectDelayMs));
      }
    }
  }

  private handleClose(): void {
    this.model = null;
    this.publishChannel = null;
    this.consumeChannel = null;

    if (this.shuttingDown) return;

    this.logger.warn('Conexão com RabbitMQ encerrada, reconectando...');
    void this.connect();
  }

  private async setupSubscription(
    channel: Channel,
    { queue, routingKeys, handler }: EventSubscription,
  ): Promise<void> {
    const deadLetterQueue = `${queue}.dlq`;

    await channel.assertExchange(BOOKINK_EVENTS_EXCHANGE, 'topic', { durable: true });

    await channel.assertQueue(deadLetterQueue, { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: deadLetterQueue,
    });

    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, BOOKINK_EVENTS_EXCHANGE, routingKey);
    }

    await channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        const event = JSON.parse(message.content.toString()) as AnyEventEnvelope;
        await handler(event);
        channel.ack(message);
      } catch (error) {
        this.logger.error(
          `Falha ao processar mensagem ${message.properties.messageId} da fila ${queue}: ${(error as Error).message}`,
        );
        channel.nack(message, false, false);
      }
    });
  }
}
