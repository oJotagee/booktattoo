import { Suspense } from 'react';

import { getPlanAccess, type PlanAccess } from '@/utils/permissions/get-plan-access';
import { type PlanCardAction, PlanCard } from './_components/plan-card';
import { PlansPageSkeleton } from './_components/plans-page-skeleton';
import { PlanSyncStatus } from './_components/plan-sync-status';
import { subscriptionPlans, type PlanId } from '@/utils/plans';
import { CurrentPlan } from './_components/current-plan';
import DashboardHeader from '../_components/header';

const SUBTITLE = 'Gerencie sua assinatura';

function resolveAction(access: PlanAccess, planId: PlanId): PlanCardAction {
  if (access.status !== 'ACTIVE') return 'checkout';

  return access.plan === planId ? 'current' : 'change';
}

export default function PlansPage() {
  return (
    <>
      <DashboardHeader title="Planos" subtitle={SUBTITLE} />

      <h1 className="text-xl font-bold md:hidden">Planos</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{SUBTITLE}</h2>

      <Suspense fallback={<PlansPageSkeleton />}>
        <PlansContent />
      </Suspense>
    </>
  );
}

async function PlansContent() {
  const access = await getPlanAccess();

  return (
    <div className="space-y-6">
      <PlanSyncStatus status={access.status} plan={access.plan} />

      <CurrentPlan access={access} />

      <section aria-label="Planos disponíveis" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} action={resolveAction(access, plan.id)} />
        ))}
      </section>

      <p className="text-center text-xs text-white/30">
        Cancele a qualquer momento · Sem fidelidade
      </p>
    </div>
  );
}
