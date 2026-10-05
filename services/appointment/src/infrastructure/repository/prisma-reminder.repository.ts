import { Injectable } from '@nestjs/common';

import { ReminderEntity } from '@/domain/entities/reminder.entity';
import { ReminderMapper } from '../persistence/reminder.mapper';
import { PrismaService } from '../prisma/prisma.service';
import type {
  FindByUserIdParams,
  PaginatedResult,
  ReminderRepository,
} from '@/application/port/reminder-repository.port';

@Injectable()
export class PrismaReminderRepository implements ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ReminderEntity | null> {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });

    return reminder ? ReminderMapper.toDomain(reminder) : null;
  }

  async findByUserId({
    userId,
    limit,
    offset,
  }: FindByUserIdParams): Promise<PaginatedResult<ReminderEntity>> {
    const [reminders, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.reminder.count({ where: { userId } }),
    ]);

    return { items: reminders.map(ReminderMapper.toDomain), total };
  }

  async create(reminder: ReminderEntity): Promise<void> {
    const data = ReminderMapper.toPersistence(reminder);

    await this.prisma.reminder.create({ data });
  }

  async update(reminder: ReminderEntity): Promise<void> {
    const data = ReminderMapper.toPersistence(reminder);

    await this.prisma.reminder.update({ where: { id: reminder.id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reminder.delete({ where: { id } });
  }
}
