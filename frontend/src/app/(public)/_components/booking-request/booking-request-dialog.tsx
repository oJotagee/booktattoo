'use client';

import { useMutation } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { type BookingRequestSchemaData, useBookingRequestSchema } from './schemas';
import { MESSAGE_MAX_LENGTH } from '@/components/conversation/message-schema';
import { createBookingRequest } from '../../_actions/create-booking-request';
import { Textarea } from '@/components/ui/textarea';
import { formatPhone } from '@/utils/formatPhone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BookingRequestDialogProps {
  artistId: string;
  artistName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingRequestDialog({
  artistId,
  artistName,
  open,
  onOpenChange,
}: BookingRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 border-b px-6 py-5 pr-14">
          <DialogTitle className="font-serif text-2xl font-normal text-white">
            Conversar com <span className="capitalize">{artistName}</span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Conte a sua ideia. Você recebe o link da conversa por e-mail para acompanhar as
            respostas.
          </DialogDescription>
        </DialogHeader>

        {open && <BookingRequestForm artistId={artistId} />}
      </DialogContent>
    </Dialog>
  );
}

function BookingRequestForm({ artistId }: { artistId: string }) {
  const router = useRouter();
  const form = useBookingRequestSchema();

  const { mutateAsync: createBookingRequestMutation, isPending } = useMutation({
    mutationFn: createBookingRequest,
  });

  async function onSubmit(values: BookingRequestSchemaData) {
    const response = await createBookingRequestMutation({ ...values, artistId });

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível enviar o seu pedido');
      return;
    }

    toast.success('Pedido enviado! Também mandamos o link da conversa para o seu e-mail.');
    router.push(`/pedido/${response.data.token}`);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 px-6 py-5"
      noValidate
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="request-name">Nome completo</FieldLabel>
              <Input
                {...field}
                id="request-name"
                placeholder="Seu nome"
                autoComplete="name"
                className="h-11"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="request-email">E-mail</FieldLabel>
              <Input
                {...field}
                id="request-email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="h-11"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="request-phone">Telefone</FieldLabel>
              <Input
                {...field}
                id="request-phone"
                type="tel"
                inputMode="numeric"
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                maxLength={15}
                className="h-11"
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="request-message">Sua ideia</FieldLabel>
              <Textarea
                {...field}
                id="request-message"
                rows={5}
                maxLength={MESSAGE_MAX_LENGTH}
                placeholder="Descreva a tatuagem: estilo, tamanho, local do corpo e referências."
                className="max-h-72"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <p className="text-xs text-white/50">
        Seus dados são compartilhados apenas com o tatuador para responder ao seu pedido. Saiba mais
        na{' '}
        <Link href="/privacidade" target="_blank" className="text-white underline">
          Política de privacidade
        </Link>
        .
      </p>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
        disabled={!form.formState.isValid || isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Enviar pedido
      </Button>
    </form>
  );
}
