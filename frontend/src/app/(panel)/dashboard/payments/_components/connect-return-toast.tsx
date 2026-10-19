'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ConnectReturnToastProps {
  paymentsEnabled: boolean;
}

export function ConnectReturnToast({ paymentsEnabled }: ConnectReturnToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const connect = searchParams.get('connect');

  useEffect(() => {
    if (!connect) return;

    if (connect === 'error') {
      toast.error('Não foi possível retomar o cadastro no Stripe. Tente novamente.');
    } else if (paymentsEnabled) {
      toast.success('Conta Stripe conectada! Você já pode receber agendamentos.');
    } else {
      toast.info(
        'Cadastro salvo. O Stripe ainda precisa de algumas informações para liberar os pagamentos.',
      );
    }

    router.replace(pathname);
  }, [connect, paymentsEnabled, pathname, router]);

  return null;
}
