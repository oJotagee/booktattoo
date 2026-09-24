import { useMutation } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { formatCurrency, parseCurrencyToCents } from '@/utils/formatService';
import { useServiceSchema, ServiceSchemaData } from './schemas';
import { createService } from '../_actions/create-service';
import { updateService } from '../_actions/update-service';
import { Service } from '../_data_access/get-all-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ServiceFormProps {
  service: Service | null;
  onSuccess: () => void;
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const form = useServiceSchema(service);

  const { mutateAsync: createServiceMutation, isPending: isCreating } = useMutation({
    mutationFn: createService,
  });

  const { mutateAsync: updateServiceMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateService,
  });

  const isPending = isCreating || isUpdating;

  async function onSubmit({ name, depositAmount, hours, minutes }: ServiceSchemaData) {
    const input = { name, depositAmount, duration: hours * 60 + minutes };

    const response = service
      ? await updateServiceMutation({ id: service.id, ...input })
      : await createServiceMutation(input);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success(service ? 'Serviço atualizado com sucesso' : 'Serviço criado com sucesso');
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <FieldDescription>Digite o nome do serviço.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="depositAmount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Depósito mínimo</FieldLabel>
              <Input
                {...field}
                id={field.name}
                inputMode="numeric"
                value={formatCurrency(field.value)}
                onChange={(e) => field.onChange(parseCurrencyToCents(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>Valor cobrado como sinal no agendamento.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="space-y-3">
          <p className="font-semibold text-sm">Tempo de duração do serviço</p>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="hours"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Horas</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Quantidade de horas.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="minutes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Minutos</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    max={59}
                    step={5}
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Quantidade de minutos.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full font-semibold bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        disabled={isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {service ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
      </Button>
    </form>
  );
}
