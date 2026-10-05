import { useMutation } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { type ReminderSchemaData, useReminderSchema } from './schemas';
import { createReminder } from '../_actions/create-reminder';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ReminderFormProps {
  onSuccess: () => void;
}

export function ReminderForm({ onSuccess }: ReminderFormProps) {
  const form = useReminderSchema();

  const { mutateAsync: createReminderMutation, isPending } = useMutation({
    mutationFn: createReminder,
  });

  async function onSubmit({ description }: ReminderSchemaData) {
    const response = await createReminderMutation({ description });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Lembrete criado com sucesso');
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={4}
                placeholder="Ex: Enviar confirmação para Mariana (09:00)"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>O que você precisa lembrar?</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="w-full font-semibold bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        disabled={isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Cadastrar Lembrete
      </Button>
    </form>
  );
}
