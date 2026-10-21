import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 2000;

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escreva uma mensagem')
    .max(MESSAGE_MAX_LENGTH, `A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`),
});

export type MessageSchemaData = z.infer<typeof messageSchema>;
