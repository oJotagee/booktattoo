import { z } from 'zod';

import { MESSAGE_MAX_LENGTH } from '@/components/conversation/message-schema';

export const bookingRequestSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo'),
  email: z.email('Informe um e-mail válido'),
  phone: z
    .string()
    .refine((value) => value.replace(/\D/g, '').length >= 10, 'Informe um telefone válido'),
  message: z
    .string()
    .trim()
    .min(10, 'Conte um pouco sobre a sua ideia')
    .max(MESSAGE_MAX_LENGTH, `A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`),
});

export type BookingRequestSchemaData = z.infer<typeof bookingRequestSchema>;
