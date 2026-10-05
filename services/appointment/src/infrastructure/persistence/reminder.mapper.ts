import type { ReminderModel as PrismaReminder } from '@generated/prisma/models';

import { ReminderEntity } from '@/domain/entities/reminder.entity';

export class ReminderMapper {
  static toDomain(reminder: PrismaReminder): ReminderEntity {
    return ReminderEntity.restore({
      id: reminder.id,
      description: reminder.description,
      userId: reminder.userId,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    });
  }

  static toPersistence(reminder: ReminderEntity): PrismaReminder {
    return {
      id: reminder.id,
      description: reminder.description,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
      userId: reminder.userId,
    };
  }
}
