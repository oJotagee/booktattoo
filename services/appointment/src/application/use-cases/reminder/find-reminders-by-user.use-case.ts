import { Inject, Injectable } from '@nestjs/common';

import type { ReminderRepository } from '../../port/reminder-repository.port';
import { REMINDER_REPOSITORY } from '../../port/reminder-repository.port';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

type FindRemindersByUserInput = {
  userId: string;
  limit?: number;
  offset?: number;
};

type ReminderOutput = {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FindRemindersByUserOutput = {
  list: ReminderOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindRemindersByUserUseCase {
  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminders: ReminderRepository,
  ) {}

  async execute({
    userId,
    limit,
    offset,
  }: FindRemindersByUserInput): Promise<FindRemindersByUserOutput> {
    const perPage = limit ?? DEFAULT_LIMIT;
    const currentOffset = offset ?? DEFAULT_OFFSET;

    const { items, total } = await this.reminders.findByUserId({
      userId,
      limit: perPage,
      offset: currentOffset,
    });

    return {
      list: items.map((reminder) => ({
        id: reminder.id,
        description: reminder.description,
        userId: reminder.userId,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      })),
      pagination: {
        total,
        page: Math.floor(currentOffset / perPage) + 1,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
}
