import { STUDIO_TIME_ZONE } from '@/lib/schedule';

const messageDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: STUDIO_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatMessageDate(date: string): string {
  return messageDateFormatter.format(new Date(date));
}
