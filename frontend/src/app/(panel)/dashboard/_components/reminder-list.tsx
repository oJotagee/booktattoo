'use client';

import { BellOff, Plus } from 'lucide-react';
import { useState } from 'react';

import type { Reminder } from '../_data-access/get-all-reminders';
import { ReminderDialog } from './reminder-dialog';
import { ReminderItem } from './reminder-item';
import { Button } from '@/components/ui/button';

interface ReminderListProps {
  reminders: Reminder[];
}

export function ReminderList({ reminders }: ReminderListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Lembretes</h2>

        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer text-muted-foreground"
          aria-label="Novo lembrete"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus />
        </Button>
      </header>

      {reminders.length ? (
        <ul className="flex flex-col gap-2 p-4">
          {reminders.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
          <BellOff className="size-6" />
          <p className="text-sm">Nenhum lembrete cadastrado.</p>
        </div>
      )}

      <ReminderDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </section>
  );
}
