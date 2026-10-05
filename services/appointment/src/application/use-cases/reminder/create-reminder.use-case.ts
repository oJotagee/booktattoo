import { Inject, Injectable } from '@nestjs/common';

import type { ReminderRepository } from '../../port/reminder-repository.port';
import { REMINDER_REPOSITORY } from '../../port/reminder-repository.port';
import { ReminderEntity } from '@/domain/entities/reminder.entity';

type CreateReminderInput = {
  userId: string;
  description: string;
};

type CreateReminderOutput = {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateReminderUseCase {
  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminders: ReminderRepository,
  ) {}

  async execute({ userId, description }: CreateReminderInput): Promise<CreateReminderOutput> {
    const reminder = ReminderEntity.create({
      id: crypto.randomUUID(),
      description,
      userId,
    });

    await this.reminders.create(reminder);

    return {
      id: reminder.id,
      description: reminder.description,
      userId: reminder.userId,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }
}
