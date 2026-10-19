import { getCurrentUser } from '../../_data-access/get-current-user';
import getSession from '@/lib/get-session';
import { DayAgendaList } from './day-agenda-list';

async function getWorkingTimes(): Promise<string[]> {
  try {
    return (await getCurrentUser()).times;
  } catch {
    return (await getSession())?.user.times ?? [];
  }
}

export async function DayAgenda() {
  return <DayAgendaList times={await getWorkingTimes()} />;
}
