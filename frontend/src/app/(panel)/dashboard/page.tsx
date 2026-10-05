import { Suspense } from 'react';

import { ReminderListSkeleton } from './_components/reminder-list-skeleton';
import { PlanStatusBanner } from './_components/plan-status-banner';
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

      <Suspense fallback={<ReminderListSkeleton rows={3} />}>
        <Reminders />
      </Suspense>
    </>
  );
}
