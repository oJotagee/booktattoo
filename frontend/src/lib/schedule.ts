export const SLOT_MINUTES = 30;
export const STUDIO_TIME_ZONE = 'America/Sao_Paulo';

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const studioDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: STUDIO_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const studioTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: STUDIO_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function requiredSlots(duration: number): number {
  return Math.max(1, Math.ceil(duration / SLOT_MINUTES));
}

// "Consecutivo" segue a ordem de `times`, não o relógio
export function isSlotSequenceAvailable(
  startTime: string,
  slots: number,
  times: string[],
  blockedTimes: string[],
): boolean {
  const blocked = new Set(blockedTimes);
  const startIndex = times.indexOf(startTime);

  if (startIndex === -1 || startIndex + slots > times.length) return false;

  return times.slice(startIndex, startIndex + slots).every((time) => !blocked.has(time));
}

// Data de hoje no fuso do estúdio, em yyyy-MM-dd (não usa toISOString, que é UTC)
export function studioToday(now: Date = new Date()): string {
  return studioDateFormatter.format(now);
}

export function isSlotInThePast(date: string, time: string, now: Date = new Date()): boolean {
  const today = studioToday(now);
  if (date !== today) return date < today;

  return time <= studioTimeFormatter.format(now);
}

export function isDateParam(value: string | null | undefined): value is string {
  return !!value && DATE_PARAM_PATTERN.test(value);
}

export function formatDateParam(
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' },
): string {
  const [year, month, day] = date.split('-').map(Number);

  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

type SlotOccupant = { time: string; duration: number };

export function buildOccupantMap<T extends SlotOccupant>(
  appointments: T[],
  times: string[],
): Map<string, T> {
  const occupants = new Map<string, T>();

  for (const appointment of appointments) {
    const startIndex = times.indexOf(appointment.time);

    if (startIndex === -1) {
      occupants.set(appointment.time, appointment);
      continue;
    }

    for (const slot of times.slice(startIndex, startIndex + requiredSlots(appointment.duration))) {
      occupants.set(slot, appointment);
    }
  }

  return occupants;
}
