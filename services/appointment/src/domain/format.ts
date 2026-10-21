import { STUDIO_TIME_ZONE } from './schedule';

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: STUDIO_TIME_ZONE,
  dateStyle: 'full',
  timeStyle: 'short',
});

const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatStudioDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatBRL(cents: number): string {
  return currencyFormat.format(cents / 100);
}
