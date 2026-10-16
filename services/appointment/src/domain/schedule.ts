// Toda a agenda trabalha em slots de 30 minutos, no fuso do estúdio. O Brasil não
// tem horário de verão desde 2019, então o offset de São Paulo é fixo
export const SLOT_MINUTES = 30;
export const STUDIO_TIME_ZONE = 'America/Sao_Paulo';
const STUDIO_UTC_OFFSET_MINUTES = -3 * 60;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export type DayRange = { start: Date; end: Date };

export type ScheduledSlot = { time: string; duration: number };

export function requiredSlots(duration: number): number {
  return Math.max(1, Math.ceil(duration / SLOT_MINUTES));
}

// "Consecutivo" segue a ordem de `times`, não o relógio: se o tatuador tem um
// intervalo (11:30 → 14:00), um flash de 1h começando 11:30 ocupa também 14:00
export function isSlotSequenceAvailable(
  startTime: string,
  slots: number,
  times: string[],
  blockedTimes: Iterable<string>,
): boolean {
  const blocked = new Set(blockedTimes);
  const startIndex = times.indexOf(startTime);

  if (startIndex === -1 || startIndex + slots > times.length) return false;

  return times.slice(startIndex, startIndex + slots).every((time) => !blocked.has(time));
}

export function buildBlockedTimes(appointments: ScheduledSlot[], times: string[]): string[] {
  const blocked = new Set<string>();

  for (const { time, duration } of appointments) {
    const startIndex = times.indexOf(time);
    if (startIndex === -1) {
      blocked.add(time);
      continue;
    }

    for (const slot of times.slice(startIndex, startIndex + requiredSlots(duration))) {
      blocked.add(slot);
    }
  }

  return [...blocked];
}

export function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function dayRange(date: string): DayRange {
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - STUDIO_UTC_OFFSET_MINUTES * MINUTE_MS);

  return { start, end: new Date(start.getTime() + DAY_MS) };
}

// O gerador de horários do perfil vai até "24:30", então somamos minutos ao
// início do dia em vez de montar uma string ISO
export function toScheduledAt(date: string, time: string): Date {
  const [, hours, minutes] = (TIME_PATTERN.exec(time) ?? []).map(Number);

  return new Date(dayRange(date).start.getTime() + (hours * 60 + minutes) * MINUTE_MS);
}

export function toSlotTime(scheduledAt: Date, date: string): string {
  const totalMinutes = Math.round(
    (scheduledAt.getTime() - dayRange(date).start.getTime()) / MINUTE_MS,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function toStudioDate(instant: Date): string {
  return new Date(instant.getTime() + STUDIO_UTC_OFFSET_MINUTES * MINUTE_MS)
    .toISOString()
    .slice(0, 10);
}

export function monthRange(instant: Date): DayRange {
  const [year, month] = toStudioDate(instant).split('-').map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    start: dayRange(`${year}-${String(month).padStart(2, '0')}-01`).start,
    end: dayRange(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01`).start,
  };
}
