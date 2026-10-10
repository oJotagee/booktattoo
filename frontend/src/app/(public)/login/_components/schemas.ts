import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export type LoginSchemaData = z.infer<typeof loginSchema>;

export function useLoginSchema() {
  return useForm<LoginSchemaData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
}

export const registerSchema = z.object({
  name: z.string().min(1, 'Informe seu nome completo.'),
  email: z.email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(8, 'Mínimo de 8 caracteres.')
    .regex(/[a-z]/, 'Inclua ao menos uma letra minúscula.')
    .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula.')
    .regex(/[0-9]/, 'Inclua ao menos um número.')
    .regex(/[^a-zA-Z0-9]/, 'Inclua ao menos um símbolo.'),
});

export type RegisterSchemaData = z.infer<typeof registerSchema>;

export function useRegisterSchema() {
  return useForm<RegisterSchemaData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });
}
