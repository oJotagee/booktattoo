'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Link from 'next/link';

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from './schemas';
import { forgotPassword } from '../_actions/forgot-password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o e-mail.');
    },
  });

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-white">Verifique seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Se existir uma conta associada a esse e-mail, enviamos um link para redefinir sua senha.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-foreground hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <h1 className="text-3xl font-semibold text-white">Esqueceu sua senha?</h1>
      <p className="text-sm text-muted-foreground">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values))}
      >
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="forgot-password-email">E-mail</FieldLabel>
            <FieldContent>
              <Input
                id="forgot-password-email"
                type="email"
                placeholder="maria@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          disabled={forgotPasswordMutation.isPending}
          className="bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        >
          {forgotPasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Enviar link de redefinição
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lembrou sua senha?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
