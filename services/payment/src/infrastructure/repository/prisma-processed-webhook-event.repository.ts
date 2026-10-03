import { Injectable } from '@nestjs/common';

import type { ProcessedWebhookEventRepository } from '@/application/port/processed-webhook-event-repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaProcessedWebhookEventRepository implements ProcessedWebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(eventId: string): Promise<boolean> {
    const event = await this.prisma.processedWebhookEvent.findUnique({ where: { id: eventId } });

    return event !== null;
  }

  async save(eventId: string, type: string): Promise<void> {
    await this.prisma.processedWebhookEvent.upsert({
      where: { id: eventId },
      create: { id: eventId, type },
      update: {},
    });
  }
}
