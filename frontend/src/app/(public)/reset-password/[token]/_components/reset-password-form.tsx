'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { resetPassword } from '../_actions/reset-password';
import { type ResetPasswordFormValues, resetPasswordSchema } from './schemas';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({ token, newPassword: values.password }),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Não foi possível redefinir a senha.');
    },
  });

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-white">Link inválido</h1>
        <p className="text-sm text-muted-foreground">
          Este link de redefinição de senha é inválido ou está incompleto. Solicite um novo.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm font-medium text-foreground hover:underline"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-white">Senha redefinida</h1>
        <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <h1 className="text-3xl font-semibold text-white">Redefinir senha</h1>
      <p className="text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit((values) => resetPasswordMutation.mutate(values))}
      >
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="reset-password-password">Nova senha</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="reset-password-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="pr-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.password]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="reset-password-confirm-password">Confirmar nova senha</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="reset-password-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className="pr-9"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          disabled={resetPasswordMutation.isPending}
          className="bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        >
          {resetPasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Redefinir senha
        </Button>
      </form>
    </div>
  );
}
