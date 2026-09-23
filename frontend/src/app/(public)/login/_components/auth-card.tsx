'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { GitHubIcon, GmailIcon } from './icons';
import { RegisterForm } from './register-form';
import { LoginForm } from './login-form';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

export function AuthCard() {
  const [tab, setTab] = useState<Tab>('login');

  const nodeEnv = process.env.NODE_ENV;

  const handleLoginGithubClick = () => {
    toast.promise(signIn('github', { callbackUrl: '/dashboard' }), {
      loading: 'Realizando login...',
      success: 'Login realizado com sucesso',
      error: 'Não foi possível realizar o login',
    });
  };

  const handleLoginGoogleClick = () => {
    toast.promise(signIn('google', { callbackUrl: '/dashboard' }), {
      loading: 'Realizando login...',
      success: 'Login realizado com sucesso',
      error: 'Não foi possível realizar o login',
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-3xl text-white font-semibold">
        {tab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {tab === 'login' ? 'Entre na sua conta' : 'Preencha os dados para começar'}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={cn(
            'rounded-md py-2 text-sm font-medium transition-colors cursor-pointer',
            tab === 'login'
              ? 'bg-orange-600 text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={cn(
            'rounded-md py-2 text-sm font-medium transition-colors cursor-pointer',
            tab === 'register'
              ? 'bg-orange-600 text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Cadastrar
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {nodeEnv === 'development' && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleLoginGithubClick}
            className="justify-center gap-2 border-white/10 bg-transparent text-white hover:bg-white/10 cursor-pointer"
          >
            <GitHubIcon className="size-4" />
            Continuar com GitHub
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleLoginGoogleClick}
          className="justify-center gap-2 border-white/10 bg-transparent text-white hover:bg-white/10 cursor-pointer"
        >
          <GmailIcon className="size-4" />
          Continuar com Google
        </Button>
      </div>

      {tab === 'login' ? <LoginForm /> : <RegisterForm />}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {tab === 'login' ? (
          <>
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={() => setTab('register')}
              className="font-medium text-foreground hover:underline cursor-pointer"
            >
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => setTab('login')}
              className="font-medium text-foreground hover:underline cursor-pointer"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
