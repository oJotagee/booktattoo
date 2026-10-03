'use client';

import { useTransition } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

import { createPortal } from '../_actions/create-portal';
import { Button } from '@/components/ui/button';

export function ManageSubscriptionButton() {
  const [isPending, startTransition] = useTransition();

  function handleManage() {
    startTransition(async () => {
      const { url, error } = await createPortal();

      if (error || !url) {
        toast.error(error ?? 'Não foi possível abrir o portal da assinatura');
        return;
      }

      window.location.href = url;
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleManage}
      disabled={isPending}
      className="cursor-pointer"
    >
      <Settings />
      {isPending ? 'Abrindo...' : 'Gerenciar assinatura'}
    </Button>
  );
}
