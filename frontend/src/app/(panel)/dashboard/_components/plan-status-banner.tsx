import { Sparkles } from 'lucide-react';
import Link from 'next/link';

import { getPlanAccess } from '@/utils/permissions/get-plan-access';
import { LabelSubscription } from '@/components/label-subscription';

export async function PlanStatusBanner() {
  const access = await getPlanAccess();

  if (access.status === 'EXPIRED') return <LabelSubscription expired />;

  if (access.status !== 'TRIAL') return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-600/40 bg-orange-600/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Sparkles className="size-5 shrink-0 text-orange-600" />
        <p className="text-sm">
          Você está no período de teste com acesso completo.{' '}
          <span className="font-semibold">
            {access.trialDaysLeft} {access.trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}.
          </span>
        </p>
      </div>

      <Link
        href="/dashboard/plans"
        className="w-fit rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:brightness-75 duration-300 cursor-pointer"
      >
        Conhecer os planos
      </Link>
    </div>
  );
}
