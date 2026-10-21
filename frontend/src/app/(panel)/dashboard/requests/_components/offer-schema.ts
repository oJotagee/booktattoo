import { z } from 'zod';

import { SLOT_MINUTES } from '@/lib/schedule';

export const OFFER_TITLE_MAX_LENGTH = 120;
export const OFFER_MIN_DURATION = 30;
export const OFFER_MAX_DURATION = 480;
export const OFFER_MIN_DEPOSIT = 50;

export const offerSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Informe um título')
      .max(
        OFFER_TITLE_MAX_LENGTH,
        `O título pode ter no máximo ${OFFER_TITLE_MAX_LENGTH} caracteres`,
      ),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha uma data'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Escolha um horário'),
    duration: z
      .number()
      .int()
      .min(OFFER_MIN_DURATION, 'Duração mínima de 30 minutos')
      .max(OFFER_MAX_DURATION, 'Duração máxima de 8 horas')
      .refine((value) => value % SLOT_MINUTES === 0, 'Use intervalos de 30 minutos'),
    price: z.number().int().positive('Informe o valor total'),
    depositAmount: z.number().int().min(OFFER_MIN_DEPOSIT, 'O sinal mínimo é R$ 0,50'),
  })
  .refine(({ price, depositAmount }) => depositAmount <= price, {
    message: 'O sinal não pode ser maior que o valor total',
    path: ['depositAmount'],
  });

export type OfferSchemaData = z.infer<typeof offerSchema>;
