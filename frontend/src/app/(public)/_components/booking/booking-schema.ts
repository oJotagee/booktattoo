import { z } from 'zod';

// Sem react-hook-form aqui: a server action create-booking também importa este schema,
// e no servidor o react-hook-form não exporta os hooks
export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha uma data'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Escolha um horário'),
  name: z.string().trim().min(2, 'Informe seu nome completo'),
  email: z.email('Informe um e-mail válido'),
  phone: z
    .string()
    .refine((value) => value.replace(/\D/g, '').length >= 10, 'Informe um telefone válido'),
});

export type BookingSchemaData = z.infer<typeof bookingSchema>;
