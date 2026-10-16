import { cn } from 'cn';

import { getDashboardStats } from '../_data-access/get-dashboard-stats';
import { formatCurrency } from '@/utils/formatService';
import { Skeleton } from '@/components/ui/skeleton';

const GRID_CLASS = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4';

const UNAVAILABLE = '—';
const UNAVAILABLE_HINT = 'indisponível no momento';

export async function StatsCards() {
  const { appointments, galeries } = await getDashboardStats();

  return (
    <div className={GRID_CLASS}>
      <StatCard
        label="Agendamentos hoje"
        value={appointments ? String(appointments.todayConfirmed) : UNAVAILABLE}
        hint={appointments ? pendingHint(appointments.todayPending) : UNAVAILABLE_HINT}
      />
      <StatCard
        label="Flashs reservados"
        value={appointments ? String(appointments.reservedFlashes) : UNAVAILABLE}
        hint={galeries ? `de ${galeries.total} totais` : UNAVAILABLE_HINT}
      />
      <StatCard
        label="Sinais recebidos"
        value={appointments ? formatCurrency(appointments.depositsThisMonth) : UNAVAILABLE}
        hint={appointments ? 'este mês' : UNAVAILABLE_HINT}
        highlight={!!appointments}
      />
      <StatCard
        label="Flashs disponíveis"
        value={galeries ? String(galeries.available) : UNAVAILABLE}
        hint={galeries ? 'na galeria' : UNAVAILABLE_HINT}
      />
    </div>
  );
}

function pendingHint(pending: number) {
  if (!pending) return 'nenhum pendente';

  return `+${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`;
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}

function StatCard({ label, value, hint, highlight = false }: StatCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card px-5 py-4">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">{label}</h2>
      <div>
        <p className={cn('font-serif text-3xl', highlight ? 'text-orange-600' : 'text-white')}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </section>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border bg-card px-5 py-4">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
