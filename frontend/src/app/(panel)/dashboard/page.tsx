import { Suspense } from 'react';

import { DayAgendaSkeleton } from './_components/day-agenda/day-agenda-list';
import { ReminderListSkeleton } from './_components/reminder-list-skeleton';
import { StatsCards, StatsCardsSkeleton } from './_components/stats-cards';
import { PaymentsSetupBanner } from './_components/payments-setup-banner';
import { PlanStatusBanner } from './_components/plan-status-banner';
import { DayAgenda } from './_components/day-agenda/day-agenda';
import { Reminders } from './_components/reminders';
import DashboardHeader from './_components/header';

export default function Dashboard() {
  const date = Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  return (
    <>
      <DashboardHeader title="Dashboard" subtitle={date} />
      <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{date}</h2>

      <Suspense fallback={null}>
        <PlanStatusBanner />
      </Suspense>

      <Suspense fallback={null}>
        <PaymentsSetupBanner />
      </Suspense>

      <div className="flex flex-col gap-6">
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Suspense fallback={<DayAgendaSkeleton />}>
            <DayAgenda />
          </Suspense>

          <Suspense fallback={<ReminderListSkeleton rows={3} />}>
            <Reminders />
          </Suspense>
        </div>
      </div>
    </>
  );
}
