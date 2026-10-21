'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  OFFER_MAX_DURATION,
  OFFER_MIN_DURATION,
  OFFER_TITLE_MAX_LENGTH,
  offerSchema,
  type OfferSchemaData,
} from './offer-schema';
import { ScheduleTimesList } from '@/app/(public)/_components/booking/schedule-times-list';
import { getBlockedTimes } from '@/app/(public)/_data-access/get-blocked-times';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { formatCurrency, formatDuration, parseCurrencyToCents } from '@/utils/formatService';
import { createBookingOffer } from '../_actions/create-booking-offer';
import type { BookingOffer } from '@/components/conversation/types';
import { SLOT_MINUTES, studioToday } from '@/lib/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DEFAULT_TITLE = 'Tatuagem personalizada';
const DEFAULT_DURATION = 60;

const DURATION_ITEMS = Array.from(
  { length: (OFFER_MAX_DURATION - OFFER_MIN_DURATION) / SLOT_MINUTES + 1 },
  (_, index) => {
    const minutes = OFFER_MIN_DURATION + index * SLOT_MINUTES;
    return { value: String(minutes), label: formatDuration(minutes) };
  },
);

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  artistId: string;
  times: string[];
  replacing: boolean;
  onCreated: (offer: BookingOffer) => Promise<void> | void;
}

export function OfferDialog({
  open,
  onOpenChange,
  requestId,
  artistId,
  times,
  replacing,
  onCreated,
}: OfferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Proposta de agendamento</DialogTitle>
          <DialogDescription>
            O cliente recebe a proposta na conversa e confirma o horário pagando o sinal. O horário
            só fica reservado depois do pagamento.
            {replacing && ' Esta proposta substitui a que está aguardando pagamento.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <OfferForm
            requestId={requestId}
            artistId={artistId}
            times={times}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface OfferFormProps {
  requestId: string;
  artistId: string;
  times: string[];
  onCreated: (offer: BookingOffer) => Promise<void> | void;
}

function OfferForm({ requestId, artistId, times, onCreated }: OfferFormProps) {
  const form = useForm<OfferSchemaData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: DEFAULT_TITLE,
      date: '',
      time: '',
      duration: DEFAULT_DURATION,
      price: 0,
      depositAmount: 0,
    },
  });

  const [date, time, duration, price, depositAmount] = useWatch({
    control: form.control,
    name: ['date', 'time', 'duration', 'price', 'depositAmount'],
  });

  const { data: blockedTimes = [], isLoading } = useQuery({
    queryKey: ['blocked-times', artistId, date],
    queryFn: () => getBlockedTimes({ artistId, date }),
    enabled: !!date,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });

  const { mutateAsync: createOfferMutation, isPending } = useMutation({
    mutationFn: createBookingOffer,
  });

  async function onSubmit(values: OfferSchemaData) {
    const response = await createOfferMutation({ id: requestId, ...values });

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível enviar a proposta');
      return;
    }

    toast.success('Proposta enviada ao cliente');
    await onCreated(response.data);
  }

  const remaining = Math.max(price - depositAmount, 0);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="offer-title">Título</FieldLabel>
              <Input
                {...field}
                id="offer-title"
                maxLength={OFFER_TITLE_MAX_LENGTH}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="offer-date">Data</FieldLabel>
                  <Input
                    {...field}
                    id="offer-date"
                    type="date"
                    min={studioToday()}
                    className="scheme-dark"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      form.setValue('time', '');
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="offer-duration">Duração</FieldLabel>
                  <Select
                    items={DURATION_ITEMS}
                    value={String(field.value)}
                    onValueChange={(value) => {
                      if (!value) return;
                      field.onChange(Number(value));
                      form.setValue('time', '');
                    }}
                  >
                    <SelectTrigger
                      id="offer-duration"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="time"
            control={form.control}
            render={({ fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Horário</FieldLabel>
                <ScheduleTimesList
                  date={date}
                  times={times}
                  blockedTimes={blockedTimes}
                  duration={duration}
                  selectedTime={time}
                  isLoading={isLoading}
                  onSelectTime={(next) => form.setValue('time', next, { shouldValidate: true })}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="offer-price">Valor total</FieldLabel>
                <Input
                  {...field}
                  id="offer-price"
                  inputMode="numeric"
                  value={formatCurrency(field.value)}
                  onChange={(event) => field.onChange(parseCurrencyToCents(event.target.value))}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="depositAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="offer-deposit">Sinal</FieldLabel>
                <Input
                  {...field}
                  id="offer-deposit"
                  inputMode="numeric"
                  value={formatCurrency(field.value)}
                  onChange={(event) => field.onChange(parseCurrencyToCents(event.target.value))}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Pago pelo cliente agora. Restante no estúdio: {formatCurrency(remaining)}.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
        disabled={isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Enviar proposta
      </Button>
    </form>
  );
}
