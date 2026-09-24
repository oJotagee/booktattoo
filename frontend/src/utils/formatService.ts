const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function parseCurrencyToCents(value: string) {
  const digits = value.replace(/\D/g, '');

  return digits ? Number(digits) : 0;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h${rest.toString().padStart(2, '0')}`;
}
