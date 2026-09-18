'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerUser } from '../_actions/register';
import { type RegisterFormValues, registerSchema } from './schemas';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser(values);

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Conta criada, mas não foi possível entrar automaticamente.');
      }
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
    >
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="register-name">Nome completo</FieldLabel>
          <FieldContent>
            <Input
              id="register-name"
              placeholder="Maria Silva"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="register-email">E-mail</FieldLabel>
          <FieldContent>
            <Input
              id="register-email"
              type="email"
              placeholder="maria@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="register-password">Senha</FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="register-password"
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
            {errors.password ? (
              <FieldError errors={[errors.password]} />
            ) : (
              <FieldDescription>Mínimo de 8 caracteres.</FieldDescription>
            )}
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={registerMutation.isPending}
        className="bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
      >
        {registerMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Criar minha conta
      </Button>
    </form>
  );
}
