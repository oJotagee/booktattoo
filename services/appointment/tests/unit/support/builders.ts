import { ReminderEntity } from '@/domain/entities/reminder.entity';

export function buildReminder(
  overrides: Partial<{
    id: string;
    description: string;
    userId: string;
  }> = {},
): ReminderEntity {
  return ReminderEntity.create({
    id: overrides.id ?? 'reminder-1',
    description: overrides.description ?? 'Comprar agulhas 3RL',
    userId: overrides.userId ?? 'user-1',
  });
}
