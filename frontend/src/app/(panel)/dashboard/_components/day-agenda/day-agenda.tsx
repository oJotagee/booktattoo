import getSession from '@/lib/get-session';
import { DayAgendaList } from './day-agenda-list';

export async function DayAgenda() {
  const session = await getSession();

  return <DayAgendaList times={session?.user.times ?? []} />;
}
