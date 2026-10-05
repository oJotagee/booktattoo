import { getAllReminders } from '../_data-access/get-all-reminders';
import { ReminderList } from './reminder-list';

const REMINDERS_LIMIT = 10;

export async function Reminders() {
  const reminders = await getAllReminders({ limit: REMINDERS_LIMIT, offset: 0 });

  return <ReminderList reminders={reminders.list} />;
}
