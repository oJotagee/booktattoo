import { describe, expect, it } from 'bun:test';

import { ReminderEntity } from '@/domain/entities/reminder.entity';
import { InvalidReminderError } from '@/domain/errors/reminder.error';

function buildReminder() {
  return ReminderEntity.create({
    id: 'reminder-1',
    description: 'Comprar agulhas 3RL',
    userId: 'user-1',
  });
}

describe('ReminderEntity', () => {
  it('creates a reminder with timestamps', () => {
    const reminder = buildReminder();

    expect(reminder.id).toBe('reminder-1');
    expect(reminder.description).toBe('Comprar agulhas 3RL');
    expect(reminder.userId).toBe('user-1');
    expect(reminder.createdAt).toBeInstanceOf(Date);
    expect(reminder.updatedAt).toBeInstanceOf(Date);
  });

  it('trims the description on creation', () => {
    const reminder = ReminderEntity.create({
      id: 'reminder-1',
      description: '  Comprar agulhas 3RL  ',
      userId: 'user-1',
    });

    expect(reminder.description).toBe('Comprar agulhas 3RL');
  });

  it('throws InvalidReminderError when id is empty', () => {
    expect(() =>
      ReminderEntity.create({ id: '  ', description: 'Comprar agulhas 3RL', userId: 'user-1' }),
    ).toThrow(InvalidReminderError);
  });

  it('throws InvalidReminderError when description is empty', () => {
    expect(() =>
      ReminderEntity.create({ id: 'reminder-1', description: '   ', userId: 'user-1' }),
    ).toThrow(InvalidReminderError);
  });

  it('updates the description keeping the other fields unchanged', () => {
    const reminder = buildReminder();

    const updated = reminder.updateDescription('Comprar agulhas 5RL');

    expect(updated.description).toBe('Comprar agulhas 5RL');
    expect(updated.id).toBe(reminder.id);
    expect(updated.userId).toBe(reminder.userId);
    expect(updated.createdAt).toBe(reminder.createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(reminder.updatedAt.getTime());
  });

  it('throws InvalidReminderError when updating to an empty description', () => {
    const reminder = buildReminder();

    expect(() => reminder.updateDescription('  ')).toThrow(InvalidReminderError);
  });

  it('restores a reminder keeping the persisted timestamps', () => {
    const createdAt = new Date('2026-01-01T10:00:00Z');
    const updatedAt = new Date('2026-01-02T10:00:00Z');

    const reminder = ReminderEntity.restore({
      id: 'reminder-1',
      description: 'Comprar agulhas 3RL',
      userId: 'user-1',
      createdAt,
      updatedAt,
    });

    expect(reminder.createdAt).toBe(createdAt);
    expect(reminder.updatedAt).toBe(updatedAt);
  });

  it('exposes a safe JSON representation', () => {
    const reminder = buildReminder();

    const json = reminder.toSafeJSON();

    expect(json.description).toBe('Comprar agulhas 3RL');
    expect(json.userId).toBe('user-1');
  });
});
