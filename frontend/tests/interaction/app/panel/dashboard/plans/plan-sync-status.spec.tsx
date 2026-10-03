import { beforeEach, describe, expect, it } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import {
  resetNextMocks,
  router,
  setPathname,
  setSearchParams,
  toast,
} from '../../../../support/next';
import { renderWithProviders } from '../../../../support/render';

const { PlanSyncStatus } = await import(
  '@/app/(panel)/dashboard/plans/_components/plan-sync-status'
);

describe('PlanSyncStatus', () => {
  beforeEach(() => {
    resetNextMocks();
    setPathname('/dashboard/plans');
  });

  it('renders nothing when there is nothing to wait for', () => {
    const { container } = renderWithProviders(<PlanSyncStatus status="TRIAL" plan={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the processing message while the checkout is not confirmed by the webhook', () => {
    setSearchParams('checkout=success');

    renderWithProviders(<PlanSyncStatus status="TRIAL" plan={null} />);

    expect(screen.getByText(/Processando pagamento/)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('confirms the checkout once the subscription is active', async () => {
    setSearchParams('checkout=success');

    renderWithProviders(<PlanSyncStatus status="ACTIVE" plan="BASIC" />);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Assinatura ativada!'));
    expect(router.replace).toHaveBeenCalledWith('/dashboard/plans');
  });

  it('keeps waiting while the plan change has not reached the user service', () => {
    setSearchParams('sync=PROFESSIONAL');

    renderWithProviders(<PlanSyncStatus status="ACTIVE" plan="BASIC" />);

    expect(screen.getByText(/Processando pagamento/)).toBeInTheDocument();
  });

  it('confirms the plan change once the new plan is active', async () => {
    setSearchParams('sync=PROFESSIONAL');

    renderWithProviders(<PlanSyncStatus status="ACTIVE" plan="PROFESSIONAL" />);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Plano alterado com sucesso!'));
    expect(router.replace).toHaveBeenCalledWith('/dashboard/plans');
  });
});
