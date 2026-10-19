import { CircleCheck, CircleAlert } from 'lucide-react';
import { Suspense } from 'react';
import { cn } from 'cn';

import { type ConnectStatus, getConnectStatus } from './_data-access/get-connect-status';
import { ConnectReturnToast } from './_components/connect-return-toast';
import { ConnectActions } from './_components/connect-actions';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardHeader from '../_components/header';

const SUBTITLE = 'Receba o sinal dos agendamentos direto na sua conta';

export default function PaymentsPage() {
  return (
    <>
      <DashboardHeader title="Recebimentos" subtitle={SUBTITLE} />

      <h1 className="text-xl font-bold md:hidden">Recebimentos</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{SUBTITLE}</h2>

      <Suspense fallback={<Skeleton className="h-44 rounded-2xl" />}>
        <PaymentsContent />
      </Suspense>
    </>
  );
}

function describeStatus({ connected, detailsSubmitted, paymentsEnabled }: ConnectStatus) {
  if (paymentsEnabled) {
    return {
      title: 'Conta Stripe conectada',
      detail:
        'O sinal de cada agendamento cai direto na sua conta Stripe. Se você cancelar um agendamento pago, o sinal é estornado ao cliente automaticamente.',
    };
  }

  if (detailsSubmitted) {
    return {
      title: 'Cadastro em análise',
      detail:
        'O Stripe está verificando seus dados. Assim que liberar os pagamentos, seu perfil volta a aceitar agendamentos.',
    };
  }

  if (connected) {
    return {
      title: 'Cadastro incompleto',
      detail: 'Termine o cadastro no Stripe para começar a receber agendamentos.',
    };
  }

  return {
    title: 'Conecte sua conta Stripe',
    detail:
      'Para receber agendamentos, os clientes pagam um sinal que vai direto para você. Crie ou conecte sua conta Stripe para começar.',
  };
}

async function PaymentsContent() {
  const status = await getConnectStatus();
  const { title, detail } = describeStatus(status);
  const Icon = status.paymentsEnabled ? CircleCheck : CircleAlert;

  return (
    <section
      aria-label="Conta de recebimento"
      className={cn(
        'flex flex-col gap-5 rounded-2xl border px-5 py-5',
        status.paymentsEnabled ? 'border-orange-600/40 bg-orange-600/5' : 'border-white/10 bg-card',
      )}
    >
      <ConnectReturnToast paymentsEnabled={status.paymentsEnabled} />

      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-orange-600" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-white/60">{detail}</p>
        </div>
      </div>

      <ConnectActions
        connected={status.connected}
        detailsSubmitted={status.detailsSubmitted}
        paymentsEnabled={status.paymentsEnabled}
      />
    </section>
  );
}
