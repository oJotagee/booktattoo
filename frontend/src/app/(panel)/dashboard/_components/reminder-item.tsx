'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Reminder } from '../_data-access/get-all-reminders';
import { deleteReminder } from '../_actions/delete-reminder';
import { Button } from '@/components/ui/button';

interface ReminderItemProps {
  reminder: Reminder;
}

export function ReminderItem({ reminder }: ReminderItemProps) {
  const { mutate, isPending } = useMutation({
    mutationFn: deleteReminder,
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Lembrete excluído com sucesso');
    },
    onError: () => toast.error('Não foi possível excluir o lembrete'),
  });

  return (
    <li className="flex items-center gap-3 rounded-lg border border-orange-600/30 bg-orange-600/5 py-2 pr-2 pl-4 text-sm">
      <span className="size-1.5 shrink-0 rounded-full bg-orange-600" />
      <p className="flex-1 break-words">{reminder.description}</p>

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 cursor-pointer text-muted-foreground hover:text-red-500"
        aria-label={`Excluir lembrete ${reminder.description}`}
        onClick={() => mutate(reminder.id)}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      </Button>
    </li>
  );
}
