import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, router, setPathname, toast } from '../../../../support/next';
import { renderWithProviders } from '../../../../support/render';
import { findPlanInfo } from '@/utils/plans';

type CheckoutResult = { url?: string; error?: string };
type ChangePlanResult = { plan?: string; error?: string };

const createCheckout = mock(async (_plan: string): Promise<CheckoutResult> => ({}));
const changePlan = mock(async (_plan: string): Promise<ChangePlanResult> => ({}));

mock.module('@/app/(panel)/dashboard/plans/_actions/create-checkout', () => ({ createCheckout }));
mock.module('@/app/(panel)/dashboard/plans/_actions/change-plan', () => ({ changePlan }));

const { PlanCard } = await import('@/app/(panel)/dashboard/plans/_components/plan-card');

describe('PlanCard', () => {
  beforeEach(() => {
    resetNextMocks();
    setPathname('/dashboard/plans');
    createCheckout.mockClear();
    changePlan.mockClear();
  });

  it('renders the plan price and the features with its limits', () => {
    renderWithProviders(<PlanCard plan={findPlanInfo('BASIC')} action="checkout" />);

    expect(screen.getByRole('article', { name: 'Plano Básico' })).toBeInTheDocument();
    expect(screen.getByText('R$ 27,90')).toBeInTheDocument();
    expect(screen.getByText('Até 3 serviços')).toBeInTheDocument();
    expect(screen.getByText('Até 5 flashs na galeria')).toBeInTheDocument();
  });

  it('disables the button of the current plan', () => {
    renderWithProviders(<PlanCard plan={findPlanInfo('BASIC')} action="current" />);

    expect(screen.getByRole('button', { name: 'Plano atual' })).toBeDisabled();
  });

  it('starts the checkout for the plan and shows the error when it fails', async () => {
    createCheckout.mockImplementationOnce(async () => ({ error: 'Stripe indisponível' }));
    const { user } = renderWithProviders(
      <PlanCard plan={findPlanInfo('PROFESSIONAL')} action="checkout" />,
    );

    await user.click(screen.getByRole('button', { name: 'Ativar assinatura' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Stripe indisponível'));
    expect(createCheckout).toHaveBeenCalledWith('PROFESSIONAL');
  });

  it('changes the plan and waits for the sync on the plans page', async () => {
    changePlan.mockImplementationOnce(async () => ({ plan: 'PROFESSIONAL' }));
    const { user } = renderWithProviders(
      <PlanCard plan={findPlanInfo('PROFESSIONAL')} action="change" />,
    );

    await user.click(screen.getByRole('button', { name: 'Mudar para este plano' }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/dashboard/plans?sync=PROFESSIONAL'),
    );
    expect(changePlan).toHaveBeenCalledWith('PROFESSIONAL');
  });

  it('shows the error when the plan change fails', async () => {
    changePlan.mockImplementationOnce(async () => ({ error: 'Este já é o plano atual.' }));
    const { user } = renderWithProviders(<PlanCard plan={findPlanInfo('BASIC')} action="change" />);

    await user.click(screen.getByRole('button', { name: 'Mudar para este plano' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Este já é o plano atual.'));
    expect(router.replace).not.toHaveBeenCalled();
  });
});
