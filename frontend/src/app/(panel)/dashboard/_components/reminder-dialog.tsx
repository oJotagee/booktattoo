'use client';

import { ReminderForm } from './reminder-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReminderDialog({ open, onOpenChange }: ReminderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Lembrete</DialogTitle>
          <DialogDescription>Adicione um novo lembrete.</DialogDescription>
        </DialogHeader>

        {open && <ReminderForm onSuccess={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
