'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';

import { MESSAGE_MAX_LENGTH, messageSchema, type MessageSchemaData } from './message-schema';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MessageComposerProps {
  placeholder?: string;
  isPending?: boolean;
  onSend: (body: string) => Promise<boolean>;
}

export function MessageComposer({ placeholder, isPending, onSend }: MessageComposerProps) {
  const form = useForm<MessageSchemaData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: '' },
  });

  const body = useWatch({ control: form.control, name: 'body' });

  async function onSubmit({ body }: MessageSchemaData) {
    const sent = await onSend(body);
    if (sent) form.reset({ body: '' });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <Controller
        name="body"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="message-body" className="sr-only">
              Sua mensagem
            </FieldLabel>
            <Textarea
              {...field}
              id="message-body"
              rows={3}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder={placeholder ?? 'Escreva sua mensagem'}
              className="max-h-60 min-h-20"
              aria-invalid={fieldState.invalid}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-white/40">
          {body.length}/{MESSAGE_MAX_LENGTH}
        </span>
        <Button
          type="submit"
          className="cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
          disabled={isPending || form.formState.isSubmitting}
        >
          {isPending || form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send />
          )}
          Enviar
        </Button>
      </div>
    </form>
  );
}
