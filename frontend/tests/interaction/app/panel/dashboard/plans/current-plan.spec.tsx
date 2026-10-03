import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen } from '@testing-library/react';

import type { PlanAccess } from '@/utils/permissions/get-plan-access';
import { renderWithProviders } from '../../../../support/render';
import { resetNextMocks } from '../../../../support/next';

mock.module('@/app/(panel)/dashboard/plans/_actions/create-portal', () => ({
  createPortal: mock(async () => ({ url: 'https://billing.stripe.com/p' })),
}));

const { CurrentPlan } = await import('@/app/(panel)/dashboard/plans/_components/current-plan');

function buildAccess(overrides: Partial<PlanAccess> = {}): PlanAccess {
  return {
    status: 'TRIAL',
    plan: null,
    limits: { services: 20, galeries: 50 },
    trialEndsAt: '2026-10-10T12:00:00.000Z',
    trialDaysLeft: 5,
    subscription: null,
    ...overrides,
  };
}

describe('CurrentPlan', () => {
  beforeEach(() => {
    resetNextMocks();
  });

  it('shows the remaining trial days', () => {
    renderWithProviders(<CurrentPlan access={buildAccess()} />);

    expect(screen.getByText('Teste grátis')).toBeInTheDocument();
    expect(screen.getByText(/5 dias restantes/)).toBeInTheDocument();
    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gerenciar assinatura/ })).not.toBeInTheDocument();
  });

  it('shows the active plan with the renewal date and the manage button', () => {
    renderWithProviders(
      <CurrentPlan
        access={buildAccess({
          status: 'ACTIVE',
          plan: 'BASIC',
          limits: { services: 3, galeries: 5 },
          subscription: {
            status: 'active',
            plan: 'BASIC',
            currentPeriodEnd: '2026-11-03T12:00:00.000Z',
            cancelAtPeriodEnd: false,
          },
        })}
      />,
    );

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Renovação em 03/11/2026')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerenciar assinatura/ })).toBeInTheDocument();
  });

  it('warns when the subscription is set to cancel at the period end', () => {
    renderWithProviders(
      <CurrentPlan
        access={buildAccess({
          status: 'ACTIVE',
          plan: 'PROFESSIONAL',
          subscription: {
            status: 'active',
            plan: 'PROFESSIONAL',
            currentPeriodEnd: '2026-11-03T12:00:00.000Z',
            cancelAtPeriodEnd: true,
          },
        })}
      />,
    );

    expect(screen.getByText('Cancelado · acesso até 03/11/2026')).toBeInTheDocument();
  });

  it('shows the expired state without the manage button', () => {
    renderWithProviders(
      <CurrentPlan access={buildAccess({ status: 'EXPIRED', limits: null, trialDaysLeft: 0 })} />,
    );

    expect(screen.getByText('Nenhum plano ativo')).toBeInTheDocument();
    expect(screen.getByText('Expirado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gerenciar assinatura/ })).not.toBeInTheDocument();
  });
});
