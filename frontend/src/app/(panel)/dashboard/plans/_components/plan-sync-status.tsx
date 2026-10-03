'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { PlanAccessStatus } from '@/utils/permissions/get-plan-access';
import type { PlanId } from '@/utils/plans';

const REFRESH_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

interface PlanSyncStatusProps {
  status: PlanAccessStatus;
  plan: PlanId | null;
}

export function PlanSyncStatus({ status, plan }: PlanSyncStatusProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [attempts, setAttempts] = useState(0);

  const awaitingCheckout = searchParams.get('checkout') === 'success';
  const awaitingPlan = searchParams.get('sync');
  const isWaiting = awaitingCheckout || Boolean(awaitingPlan);

  const isSynced = awaitingPlan
    ? status === 'ACTIVE' && plan === awaitingPlan
    : awaitingCheckout && status === 'ACTIVE';

  useEffect(() => {
    if (!isWaiting) return;

    if (isSynced) {
      toast.success(awaitingPlan ? 'Plano alterado com sucesso!' : 'Assinatura ativada!');
      router.replace(pathname);
      return;
    }

    if (attempts >= MAX_ATTEMPTS) return;

    const timer = setTimeout(() => {
      setAttempts((current) => current + 1);
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isWaiting, isSynced, attempts, awaitingPlan, pathname, router]);

  if (!isWaiting || isSynced) return null;

  return (
    <output className="flex items-center gap-3 rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-white/70">
      {attempts < MAX_ATTEMPTS ? (
        <>
          <LoaderCircle className="size-4 animate-spin text-orange-600" />
          Processando pagamento... a confirmação do Stripe pode levar alguns segundos.
        </>
      ) : (
        'O pagamento ainda está sendo processado. Atualize a página em instantes.'
      )}
    </output>
  );
}
