import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { ReminderEntity } from '@/domain/entities/reminder.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { PrismaReminderRepository } from '@/infrastructure/repository/prisma-reminder.repository';

describe('PrismaReminderRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaReminderRepository(prismaService);
  const createdReminderIds: string[] = [];

  function buildReminder(overrides: Partial<{ id: string; description: string; userId: string }>) {
    const reminder = ReminderEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      description: overrides.description ?? 'Comprar agulhas 3RL',
      userId: overrides.userId!,
    });
    createdReminderIds.push(reminder.id);

    return reminder;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdReminderIds.length > 0) {
      await prismaService.reminder.deleteMany({ where: { id: { in: createdReminderIds } } });
      createdReminderIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findById', () => {
    it('persists a reminder and rehydrates it from the database', async () => {
      const user = { id: crypto.randomUUID() };
      const reminder = buildReminder({ userId: user.id });

      await repository.create(reminder);

      const found = await repository.findById(reminder.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(ReminderEntity);
      expect(found?.id).toBe(reminder.id);
      expect(found?.description).toBe(reminder.description);
      expect(found?.userId).toBe(user.id);
    });

    it('returns null when the id does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('finds only the reminders belonging to the user, newest first', async () => {
      const user = { id: crypto.randomUUID() };
      const older = buildReminder({ userId: user.id, description: 'Comprar agulhas' });
      await repository.create(older);
      await Bun.sleep(5);
      const newer = buildReminder({ userId: user.id, description: 'Limpar a maca' });
      await repository.create(newer);
      await repository.create(buildReminder({ userId: crypto.randomUUID() }));

      const found = await repository.findByUserId({ userId: user.id, limit: 10, offset: 0 });

      expect(found.items.map((reminder) => reminder.id)).toEqual([newer.id, older.id]);
      expect(found.total).toBe(2);
    });

    it('returns an empty page when the user has no reminders', async () => {
      const found = await repository.findByUserId({
        userId: crypto.randomUUID(),
        limit: 10,
        offset: 0,
      });

      expect(found.items).toEqual([]);
      expect(found.total).toBe(0);
    });

    it('respects limit and offset', async () => {
      const user = { id: crypto.randomUUID() };
      await repository.create(buildReminder({ userId: user.id }));
      await repository.create(buildReminder({ userId: user.id }));

      const found = await repository.findByUserId({ userId: user.id, limit: 1, offset: 1 });

      expect(found.items).toHaveLength(1);
      expect(found.total).toBe(2);
    });
  });

  describe('update', () => {
    it('persists changes made to the reminder', async () => {
      const user = { id: crypto.randomUUID() };
      const reminder = buildReminder({ userId: user.id });
      await repository.create(reminder);

      await repository.update(reminder.updateDescription('Comprar agulhas 5RL'));

      const found = await repository.findById(reminder.id);

      expect(found?.description).toBe('Comprar agulhas 5RL');
    });
  });

  describe('delete', () => {
    it('removes the reminder from the database', async () => {
      const user = { id: crypto.randomUUID() };
      const reminder = buildReminder({ userId: user.id });
      await repository.create(reminder);

      await repository.delete(reminder.id);

      expect(await repository.findById(reminder.id)).toBeNull();
    });
  });
});
