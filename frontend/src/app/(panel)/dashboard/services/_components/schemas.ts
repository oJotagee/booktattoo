import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Service } from '../_data_access/get-all-services';

export const serviceSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório'),
    depositAmount: z.number().int().positive('Informe o valor do depósito mínimo'),
    hours: z
      .number({ error: 'Informe as horas' })
      .int('Use um número inteiro')
      .min(0, 'Não pode ser negativo'),
    minutes: z
      .number({ error: 'Informe os minutos' })
      .int('Use um número inteiro')
      .min(0, 'Não pode ser negativo')
      .max(59, 'Máximo de 59 minutos'),
  })
  .refine(({ hours, minutes }) => hours * 60 + minutes > 0, {
    message: 'A duração deve ser maior que zero',
    path: ['hours'],
  });

export type ServiceSchemaData = z.infer<typeof serviceSchema>;

export function useServiceSchema(service?: Service | null) {
  const duration = service?.duration ?? 60;

  return useForm<ServiceSchemaData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? '',
      depositAmount: service?.depositAmount ?? 0,
      hours: Math.floor(duration / 60),
      minutes: duration % 60,
    },
  });
}
