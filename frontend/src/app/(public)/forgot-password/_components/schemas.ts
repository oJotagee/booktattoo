import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
});

export type ForgotPasswordSchemaData = z.infer<typeof forgotPasswordSchema>;

export function useForgotPasswordSchema() {
  return useForm<ForgotPasswordSchemaData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
}
