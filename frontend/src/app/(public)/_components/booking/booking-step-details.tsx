import { Controller, type UseFormReturn, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { getBlockedTimes } from '../../_data-access/get-blocked-times';
import { ScheduleTimesList } from './schedule-times-list';
import type { BookingSchemaData } from './schemas';
import { formatPhone } from '@/utils/formatPhone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { studioToday } from '@/lib/schedule';

interface BookingStepDetailsProps {
  form: UseFormReturn<BookingSchemaData>;
  artistId: string;
  times: string[];
  duration: number;
  onContinue: () => void;
}

const SECTION_LABEL_CLASS = 'text-xs font-medium uppercase tracking-widest text-white/50';

export function BookingStepDetails({
  form,
  artistId,
  times,
  duration,
  onContinue,
}: BookingStepDetailsProps) {
  const [date, time] = useWatch({ control: form.control, name: ['date', 'time'] });

  const { data: blockedTimes = [], isLoading } = useQuery({
    queryKey: ['blocked-times', artistId, date],
    queryFn: () => getBlockedTimes({ artistId, date }),
    enabled: !!date,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });

  return (
    <form
      onSubmit={form.handleSubmit(onContinue)}
      className="flex flex-col gap-6 px-6 py-5"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          name="date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={SECTION_LABEL_CLASS}>
                Data
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="date"
                min={studioToday()}
                className="h-11 scheme-dark"
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  form.setValue('time', '', { shouldValidate: true });
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex flex-col gap-3">
          <span className={SECTION_LABEL_CLASS}>Horário</span>
          <ScheduleTimesList
            date={date}
            times={times}
            blockedTimes={blockedTimes}
            duration={duration}
            selectedTime={time}
            isLoading={isLoading}
            onSelectTime={(next) => form.setValue('time', next, { shouldValidate: true })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t pt-5">
        <span className={SECTION_LABEL_CLASS}>Seus dados</span>

        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
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
                <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
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
                <FieldLabel htmlFor={field.name}>Telefone</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
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
        </FieldGroup>
      </div>

      <p className="text-xs text-white/50">
        Seus dados são usados apenas para registrar o agendamento e são compartilhados com o
        tatuador responsável. Saiba mais na{' '}
        <Link href="/privacidade" target="_blank" className="text-white underline">
          Política de privacidade
        </Link>
        .
      </p>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
        disabled={!form.formState.isValid}
      >
        Continuar para pagamento →
      </Button>
    </form>
  );
}
