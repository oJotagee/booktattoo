import { STUDIO_TIME_ZONE } from '@/lib/schedule';

const offerDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: STUDIO_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const offerTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: STUDIO_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

export function formatOfferDate(scheduledAt: string): string {
  const date = new Date(scheduledAt);

  return `${offerDateFormatter.format(date)} às ${offerTimeFormatter.format(date)}`;
}
