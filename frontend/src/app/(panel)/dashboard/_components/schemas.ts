import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const reminderSchema = z.object({
  description: z.string().trim().min(1, 'Descrição é obrigatória'),
});

export type ReminderSchemaData = z.infer<typeof reminderSchema>;

export function useReminderSchema() {
  return useForm<ReminderSchemaData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      description: '',
    },
  });
}
