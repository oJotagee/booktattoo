import { describe, expect, it } from 'bun:test';

import {
  buildOccupantMap,
  formatDateParam,
  isDateParam,
  isSlotInThePast,
  isSlotSequenceAvailable,
  requiredSlots,
  studioToday,
} from '@/lib/schedule';

const TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00'];

describe('schedule', () => {
  it('rounds the duration up to 30 minute slots', () => {
    expect(requiredSlots(30)).toBe(1);
    expect(requiredSlots(60)).toBe(2);
    expect(requiredSlots(75)).toBe(3);
    expect(requiredSlots(0)).toBe(1);
  });

  describe('isSlotSequenceAvailable', () => {
    it('accepts a free sequence', () => {
      expect(isSlotSequenceAvailable('09:00', 2, TIMES, ['10:00'])).toBe(true);
    });

    it('rejects a sequence that hits a blocked slot', () => {
      expect(isSlotSequenceAvailable('09:30', 2, TIMES, ['10:00'])).toBe(false);
    });

    it('rejects a sequence that runs past the last slot', () => {
      expect(isSlotSequenceAvailable('14:00', 2, TIMES, [])).toBe(false);
    });

    it('crosses gaps in the artist times', () => {
      expect(isSlotSequenceAvailable('11:00', 2, TIMES, [])).toBe(true);
    });
  });

  describe('studio time zone', () => {
    // 01:30 UTC de 17/10 ainda é 22:30 de 16/10 em São Paulo
    const lateEvening = new Date('2026-10-17T01:30:00.000Z');

    it('uses the studio date instead of the UTC date', () => {
      expect(studioToday(lateEvening)).toBe('2026-10-16');
    });

    it('marks earlier slots of today as past', () => {
      expect(isSlotInThePast('2026-10-16', '22:00', lateEvening)).toBe(true);
      expect(isSlotInThePast('2026-10-16', '22:30', lateEvening)).toBe(true);
      expect(isSlotInThePast('2026-10-16', '23:00', lateEvening)).toBe(false);
    });

    it('compares other days by date', () => {
      expect(isSlotInThePast('2026-10-15', '23:30', lateEvening)).toBe(true);
      expect(isSlotInThePast('2026-10-17', '00:00', lateEvening)).toBe(false);
    });
  });

  it('validates date params', () => {
    expect(isDateParam('2026-10-16')).toBe(true);
    expect(isDateParam('16/10/2026')).toBe(false);
    expect(isDateParam(null)).toBe(false);
  });

  it('formats a date param without shifting the day', () => {
    expect(
      formatDateParam('2026-10-16', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    ).toBe('16/10/2026');
  });

  it('maps every covered slot to its appointment', () => {
    const appointment = { id: 'a', time: '09:30', duration: 90 };
    const occupants = buildOccupantMap([appointment], TIMES);

    expect([...occupants.keys()]).toEqual(['09:30', '10:00', '10:30']);
    expect(occupants.get('10:30')).toBe(appointment);
  });
});
