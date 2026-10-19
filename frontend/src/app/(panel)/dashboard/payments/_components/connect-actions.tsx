'use client';

import { ExternalLink, Wallet } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { openStripeDashboard } from '../_actions/open-stripe-dashboard';
import { startOnboarding } from '../_actions/start-onboarding';
import { Button } from '@/components/ui/button';

interface ConnectActionsProps {
  connected: boolean;
  detailsSubmitted: boolean;
  paymentsEnabled: boolean;
}

export function ConnectActions({
  connected,
  detailsSubmitted,
  paymentsEnabled,
}: ConnectActionsProps) {
  const [isPending, startTransition] = useTransition();

  function redirectWith(action: () => Promise<{ url?: string; error?: string }>, fallback: string) {
    startTransition(async () => {
      const { url, error } = await action();

      if (error || !url) {
        toast.error(error ?? fallback);
        return;
      }

      window.location.href = url;
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!paymentsEnabled && (
        <Button
          onClick={() =>
            redirectWith(startOnboarding, 'Não foi possível abrir o cadastro no Stripe')
          }
          disabled={isPending}
          className="cursor-pointer bg-orange-600 text-white hover:bg-orange-600/80"
        >
          <Wallet />
          {connected ? 'Continuar cadastro no Stripe' : 'Conectar com Stripe'}
        </Button>
      )}

      {detailsSubmitted && (
        <Button
          variant="outline"
          onClick={() =>
            redirectWith(openStripeDashboard, 'Não foi possível abrir o painel do Stripe')
          }
          disabled={isPending}
          className="cursor-pointer"
        >
          <ExternalLink />
          Abrir painel do Stripe
        </Button>
      )}
    </div>
  );
}
