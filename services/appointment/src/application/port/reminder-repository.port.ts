import type { ReminderEntity } from '@/domain/entities/reminder.entity';

export const REMINDER_REPOSITORY = Symbol('REMINDER_REPOSITORY');

export type FindByUserIdParams = {
  userId: string;
  limit: number;
  offset: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export interface ReminderRepository {
  findById(id: string): Promise<ReminderEntity | null>;
  findByUserId(params: FindByUserIdParams): Promise<PaginatedResult<ReminderEntity>>;
  create(reminder: ReminderEntity): Promise<void>;
  update(reminder: ReminderEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
