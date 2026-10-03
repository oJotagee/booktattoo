import { cn } from 'cn';

import type { PlanAccess } from '@/utils/permissions/get-plan-access';
import { ManageSubscriptionButton } from './manage-subscription-button';
import { findPlanInfo } from '@/utils/plans';

interface CurrentPlanProps {
  access: PlanAccess;
}

function formatDate(value: string): string {
  return Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}

function describeAccess({ status, plan, subscription, trialDaysLeft, trialEndsAt }: PlanAccess) {
  if (status === 'ACTIVE' && plan) {
    const periodEnd = subscription?.currentPeriodEnd;

    return {
      label: 'Seu plano atual',
      title: findPlanInfo(plan).name,
      detail: periodEnd
        ? subscription?.cancelAtPeriodEnd
          ? `Cancelado · acesso até ${formatDate(periodEnd)}`
          : `Renovação em ${formatDate(periodEnd)}`
        : 'Assinatura ativa',
      badge: subscription?.cancelAtPeriodEnd ? 'Cancelado' : 'Ativo',
      highlight: true,
    };
  }

  if (status === 'TRIAL') {
    return {
      label: 'Período de teste',
      title: 'Teste grátis',
      detail: `${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'} · termina em ${formatDate(trialEndsAt)}`,
      badge: 'Teste',
      highlight: true,
    };
  }

  return {
    label: 'Período de teste encerrado',
    title: 'Nenhum plano ativo',
    detail: 'Assine um plano para continuar cadastrando serviços e produtos.',
    badge: 'Expirado',
    highlight: false,
  };
}

export function CurrentPlan({ access }: CurrentPlanProps) {
  const { label, title, detail, badge, highlight } = describeAccess(access);
  const canManage = Boolean(access.subscription && access.subscription.status !== 'canceled');

  return (
    <section
      aria-label="Plano atual"
      className={cn(
        'flex flex-col gap-4 rounded-2xl border px-5 py-5 sm:flex-row sm:items-center sm:justify-between',
        highlight ? 'border-orange-600/40 bg-orange-600/5' : 'border-white/10 bg-card',
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">{label}</p>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{detail}</p>
      </div>

      <div className="flex items-center gap-3">
        {canManage && <ManageSubscriptionButton />}
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            highlight ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60',
          )}
        >
          {badge}
        </span>
      </div>
    </section>
  );
}
